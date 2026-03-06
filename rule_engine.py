"""
rule_engine.py — Clinerva Clinical Trial Eligibility Rule Engine
Evaluates whether an anonymized patient meets trial inclusion/exclusion criteria.
Pure Python only — no external libraries.
"""

import json


# ─────────────────────────────────────────────────────────────
# Utility: resolve a value from a nested dict using dot-notation
# e.g.  get_value(patient, "labResults.HbA1c")  ->  7.8
# ─────────────────────────────────────────────────────────────

def _get_value(patient: dict, key: str):
    """
    Retrieve a value from the patient dict using optional dot-notation
    for nested keys (e.g. 'labResults.HbA1c').
    Returns None if the key path does not exist.
    """
    parts = key.split(".")
    current = patient
    for part in parts:
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


# ─────────────────────────────────────────────────────────────
# Core Rule Engine
# ─────────────────────────────────────────────────────────────

def check_eligibility(patient: dict, trial_criteria: dict) -> dict:
    """
    Evaluate a patient's eligibility against clinical trial criteria.

    Rules applied:
      Rule 1 — Range check: criterion dict with 'min'/'max' keys
      Rule 2 — Exact match: criterion is a plain string
      Rule 3 — Exclusion check: immediate disqualification if patient
               value appears in the exclusion list
      Rule 4 — Nested value resolution via dot-notation for labResults

    Args:
        patient:        Anonymized patient dict (from anonymize_patient).
        trial_criteria: Dict with 'inclusion' and 'exclusion' sub-dicts.

    Returns:
        Result dict with eligible bool, per-criterion results, failedCriteria,
        and disqualifiedBy.
    """
    patient_id = patient.get("patientId", "UNKNOWN")
    results = []
    failed_criteria = []
    disqualified_by = None

    # ── Rule 3: Exclusion checks (run first — immediate disqualification) ──
    exclusions = trial_criteria.get("exclusion", {})

    for exc_field, exc_values in exclusions.items():
        # Resolve the patient value for this field (supports flat or nested)
        # For exclusion, we check top-level list fields (e.g. medications,
        # surgicalHistory).  surgicalHistory may be a string or list.
        patient_val = _get_value(patient, exc_field)

        if patient_val is None:
            continue

        # Normalise to list for uniform comparison
        patient_list = patient_val if isinstance(patient_val, list) else [patient_val]

        triggered = any(item in exc_values for item in patient_list)

        if triggered:
            # Add a FAIL result entry and immediately return
            actual_display = patient_val
            results.append({
                "criterion": exc_field,
                "required": f"NOT in {exc_values}",
                "actual": actual_display,
                "status": "FAIL (EXCLUDED)",
            })
            failed_criteria.append(exc_field)
            return {
                "patientId": patient_id,
                "eligible": False,
                "results": results,
                "failedCriteria": failed_criteria,
                "disqualifiedBy": exc_field,
            }

    # ── Rules 1 & 2: Inclusion checks ────────────────────────────────────
    inclusions = trial_criteria.get("inclusion", {})

    for inc_field, requirement in inclusions.items():
        # Resolve value — labResults fields are accessed via dot-notation
        # First try top-level, then try labResults.{field} as fallback
        patient_val = _get_value(patient, inc_field)
        if patient_val is None:
            patient_val = _get_value(patient, f"labResults.{inc_field}")

        # ── Rule 1: Range check ──────────────────────────────────────────
        if isinstance(requirement, dict) and ("min" in requirement or "max" in requirement):
            low = requirement.get("min", float("-inf"))
            high = requirement.get("max", float("inf"))

            # Build human-readable required string
            if "min" in requirement and "max" in requirement:
                required_str = f"{low}-{high}"
            elif "min" in requirement:
                required_str = f">={low}"
            else:
                required_str = f"<={high}"

            if patient_val is not None and low <= patient_val <= high:
                status = "PASS"
            else:
                status = "FAIL"
                failed_criteria.append(inc_field)
                if disqualified_by is None:
                    disqualified_by = inc_field

            results.append({
                "criterion": inc_field,
                "required": required_str,
                "actual": patient_val,
                "status": status,
            })

        # ── Rule 2: Exact string match ───────────────────────────────────
        elif isinstance(requirement, str):
            if patient_val == requirement:
                status = "PASS"
            else:
                status = "FAIL"
                failed_criteria.append(inc_field)
                if disqualified_by is None:
                    disqualified_by = inc_field

            results.append({
                "criterion": inc_field,
                "required": requirement,
                "actual": patient_val,
                "status": status,
            })

        # ── Allowed list (e.g. smokingStatus: ["Never", "Former"]) ──────
        elif isinstance(requirement, list):
            if patient_val in requirement:
                status = "PASS"
            else:
                status = "FAIL"
                failed_criteria.append(inc_field)
                if disqualified_by is None:
                    disqualified_by = inc_field

            results.append({
                "criterion": inc_field,
                "required": f"one of {requirement}",
                "actual": patient_val,
                "status": status,
            })

    eligible = len(failed_criteria) == 0

    return {
        "patientId": patient_id,
        "eligible": eligible,
        "results": results,
        "failedCriteria": failed_criteria,
        "disqualifiedBy": disqualified_by if not eligible else None,
    }


# ─────────────────────────────────────────────────────────────
# Test Harness
# ─────────────────────────────────────────────────────────────

# Hardcoded base patient for testing (post-anonymization format)
BASE_PATIENT = {
    "patientId": "CLN-A3F8B21C",
    "age": 52,
    "diagnosis": "Type 2 Diabetes",
    "labResults": {"HbA1c": 7.8, "eGFR": 65},
    "smokingStatus": "Never",
    "surgicalHistory": "None",
    "medications": ["Metformin"],
}

# Hardcoded trial criteria for testing
BASE_CRITERIA = {
    "inclusion": {
        "age":          {"min": 40, "max": 65},
        "diagnosis":    "Type 2 Diabetes",
        "HbA1c":        {"min": 7.0, "max": 10.0},
        "smokingStatus": "Never",
        "eGFR":         {"min": 45},
    },
    "exclusion": {
        "surgicalHistory": ["cardiac surgery"],
        "medications":     ["insulin"],
    },
}


def _make_patient(**overrides) -> dict:
    """Return a copy of BASE_PATIENT with specific fields overridden."""
    import copy
    p = copy.deepcopy(BASE_PATIENT)
    for key, val in overrides.items():
        if "." in key:
            # Support nested override like "labResults.HbA1c"
            parts = key.split(".", 1)
            p[parts[0]][parts[1]] = val
        else:
            p[key] = val
    return p


def _run_tests():
    passes = 0
    failures = 0

    print("\n" + "=" * 56)
    print("   Clinerva Rule Engine - Eligibility Test Results")
    print("=" * 56)

    # ── Test 1: Patient above age limit → eligible false ──────
    old_patient = _make_patient(age=70)
    res1 = check_eligibility(old_patient, BASE_CRITERIA)
    expected1 = res1["eligible"] is False and res1["disqualifiedBy"] == "age"
    status1 = "PASS" if expected1 else "FAIL"
    print(f"\n[{status1}] Test 1 - Patient above age limit (age=70) -> eligible: False")
    print(f"       DETAIL: eligible={res1['eligible']}, disqualifiedBy={res1['disqualifiedBy']}")
    if expected1:
        passes += 1
    else:
        failures += 1

    # ── Test 2: Exclusion medication triggered → eligible false ──
    medicated_patient = _make_patient(medications=["insulin"])
    res2 = check_eligibility(medicated_patient, BASE_CRITERIA)
    expected2 = res2["eligible"] is False and res2["disqualifiedBy"] == "medications"
    status2 = "PASS" if expected2 else "FAIL"
    print(f"\n[{status2}] Test 2 - Exclusion medication 'insulin' -> eligible: False")
    print(f"       DETAIL: eligible={res2['eligible']}, disqualifiedBy={res2['disqualifiedBy']}")
    if expected2:
        passes += 1
    else:
        failures += 1

    # ── Test 3: All criteria pass → eligible true ─────────────
    res3 = check_eligibility(BASE_PATIENT, BASE_CRITERIA)
    expected3 = res3["eligible"] is True and res3["disqualifiedBy"] is None
    status3 = "PASS" if expected3 else "FAIL"
    print(f"\n[{status3}] Test 3 - All criteria pass -> eligible: True")
    print(f"       DETAIL: eligible={res3['eligible']}, failedCriteria={res3['failedCriteria']}")
    if expected3:
        passes += 1
    else:
        failures += 1

    # ── Test 4: Borderline values (age=40, HbA1c=7.0) → eligible true ──
    borderline_patient = _make_patient(age=40, **{"labResults.HbA1c": 7.0})
    res4 = check_eligibility(borderline_patient, BASE_CRITERIA)
    expected4 = res4["eligible"] is True
    status4 = "PASS" if expected4 else "FAIL"
    print(f"\n[{status4}] Test 4 - Borderline (age=40, HbA1c=7.0) -> eligible: True")
    print(f"       DETAIL: eligible={res4['eligible']}, failedCriteria={res4['failedCriteria']}")
    if expected4:
        passes += 1
    else:
        failures += 1

    print("\n" + "-" * 56)
    print(f"   Results: {passes} PASSED, {failures} FAILED")
    print(f"   Overall: {'ALL TESTS PASSED' if failures == 0 else 'SOME TESTS FAILED'}")
    print("=" * 56 + "\n")

    # ── Print full eligibility report for base patient ────────
    print("Full eligibility report for base patient:")
    print(json.dumps(res3, indent=2))


if __name__ == "__main__":
    _run_tests()
