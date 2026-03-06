"""
reverse_rule_engine.py — Clinerva Reverse Matching Engine
Given parsed trial criteria, scores ALL patients in the database
and returns a ranked list of best candidates.

Depends on: rule_engine, ml_scorer, explainer, data_layer
"""

import time
from datetime import datetime, timezone

from rule_engine import check_eligibility
from ml_scorer import calculate_score
from explainer import explain
from data_layer import anonymize_patient


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _city(location_str: str) -> str:
    """Extract the first token (city) from a location string."""
    return location_str.split(",")[0].strip().lower() if location_str else ""


def _location_filter_match(patient_location: str, filter_location: str) -> bool:
    """Return True if patient city matches the filter city (case-insensitive)."""
    return _city(patient_location) == _city(filter_location)


def _reason_for_fail(rule_result: dict, parsed_criteria: dict) -> str:
    """Build a human-readable reason why a patient was disqualified."""
    disq_by = rule_result.get("disqualifiedBy")
    if not disq_by:
        fails = rule_result.get("failedCriteria", [])
        return f"Failed criteria: {', '.join(fails)}" if fails else "Did not meet inclusion criteria"

    # Find actual vs required from results
    for item in rule_result.get("results", []):
        if item.get("criterion") == disq_by:
            return (
                f"{disq_by.capitalize()} {item.get('actual')} "
                f"does not meet required {item.get('required')}"
            )
    return f"Disqualified by: {disq_by}"


def _recruitment_note(score_result: dict, patient: dict, trial_loc: str) -> str:
    """One-line recruitment note for the doctor view."""
    score = score_result.get("finalScore", 0)
    cat   = score_result.get("category", "")
    p_loc = _city(patient.get("location", ""))
    t_loc = _city(trial_loc)
    loc_note = "Located in same city as trial." if p_loc == t_loc else f"Located in {patient.get('location', 'unknown')}."
    if score >= 90:
        return f"Excellent candidate. All criteria met. {loc_note}"
    elif score >= 70:
        return f"Good candidate. Most criteria met. {loc_note}"
    elif score >= 50:
        return f"Partial match. Some criteria may need review. {loc_note}"
    else:
        return f"Weak match ({cat}). {loc_note}"


# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION 1: match_patients_to_criteria
# ─────────────────────────────────────────────────────────────────────────────

def match_patients_to_criteria(
    parsed_criteria: dict,
    patients_list: list,
    location_filter: str = None,
    min_score: float = 0,
) -> dict:
    """
    Score and rank all patients against parsed trial criteria.

    Args:
        parsed_criteria:  Output of gemini_parser.parse_criteria() or fallback.
        patients_list:    List of raw patient dicts (will be anonymized internally).
        location_filter:  Optional city string — only include patients in this city.
        min_score:        Minimum finalScore to include in ranked results (0 = no filter).

    Returns:
        Full result dict with rankedPatients, disqualifiedPatients, and metadata.
    """
    t_start = time.time()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

    inclusion   = parsed_criteria.get("inclusion", {})
    raw_input   = parsed_criteria.get("rawInput", "")
    confidence  = parsed_criteria.get("parsingConfidence", 0)
    trial_loc   = inclusion.get("location", "Unknown")
    trial_phase = parsed_criteria.get("phase", inclusion.get("phase", 3))

    # Build a trial_mock for ml_scorer and explainer
    trial_mock = {
        "trialId":  "REVERSE-MATCH",
        "location": trial_loc,
        "phase":    trial_phase,
        "criteria": parsed_criteria,
    }

    ranked_patients     = []
    disqualified_patients = []
    filtered_by_location  = 0

    for raw_patient in patients_list:
        # Anonymize
        try:
            patient = anonymize_patient(raw_patient)
        except Exception:
            patient = dict(raw_patient)  # use as-is if anonymization fails

        patient_id  = patient.get("patientId", "UNKNOWN")
        patient_loc = raw_patient.get("location", patient.get("location", ""))
        patient["location"] = patient_loc  # preserve original location

        # ── Step 1: Rule check ────────────────────────────────────────────────
        try:
            rule_result = check_eligibility(patient, parsed_criteria)
        except Exception as e:
            disqualified_patients.append({
                "patientId":      patient_id,
                "disqualifiedBy": "error",
                "reason":         str(e),
            })
            continue

        if not rule_result.get("eligible"):
            disqualified_patients.append({
                "patientId":      patient_id,
                "disqualifiedBy": rule_result.get("disqualifiedBy", "unknown"),
                "reason":         _reason_for_fail(rule_result, parsed_criteria),
            })
            continue

        # ── Step 2: ML score ──────────────────────────────────────────────────
        try:
            score_result = calculate_score(patient, trial_mock, rule_result)
        except Exception:
            score_result = {
                "finalScore": 50.0, "confidenceScore": 50.0,
                "category": "Partial Match", "color": "yellow",
                "mlProbability": 0.5, "mlScore": 50.0,
                "ruleScore": 50.0, "featureVector": {},
                "patientId": patient_id, "trialId": "REVERSE-MATCH",
            }

        final_score = score_result.get("finalScore", 0)

        # ── Step 3: Explanation ───────────────────────────────────────────────
        try:
            explanation = explain(patient, trial_mock, score_result)
            # Inject recruitmentNote into doctorView
            explanation["doctorView"]["recruitmentNote"] = _recruitment_note(
                score_result, patient, trial_loc
            )
        except Exception as ex:
            explanation = {
                "doctorView": {
                    "summary": f"Score: {final_score}%",
                    "strengthFactors": [], "riskFactors": [],
                    "shapExplanation": [],
                    "recruitmentNote": _recruitment_note(score_result, patient, trial_loc),
                },
                "patientView": {"headline": f"{int(final_score)}% match", "whatHelped": [], "whatHurt": []},
            }

        # ── Step 4: Geographic filter ─────────────────────────────────────────
        if location_filter:
            if not _location_filter_match(patient_loc, location_filter):
                filtered_by_location += 1
                continue

        # ── Step 5: Min score filter ──────────────────────────────────────────
        if final_score < min_score:
            continue

        # ── Build result entry ────────────────────────────────────────────────
        criteria_results = [
            {
                "criterion": r.get("criterion"),
                "status":    r.get("status"),
                "required":  r.get("required"),
                "actual":    r.get("actual"),
            }
            for r in rule_result.get("results", [])
        ]

        distance_km = 0 if _city(patient_loc) == _city(trial_loc) else None

        ranked_patients.append({
            "patientId":        patient_id,
            "age":              patient.get("age"),
            "gender":           patient.get("gender", ""),
            "diagnosis":        patient.get("diagnosis", ""),
            "location":         patient_loc,
            "distanceKm":       distance_km,
            "finalScore":       final_score,
            "confidenceScore":  score_result.get("mlScore", final_score),
            "category":         score_result.get("category"),
            "color":            score_result.get("color"),
            "criteriaResults":  criteria_results,
            "explanation":      explanation,
        })

    # ── Step 6: Sort by finalScore descending ────────────────────────────────
    ranked_patients.sort(key=lambda p: p["finalScore"], reverse=True)

    # Add rank numbers
    for i, p in enumerate(ranked_patients, 1):
        p["rank"] = i

    elapsed = round(time.time() - t_start, 2)

    return {
        "criteriaText":           raw_input,
        "parsedCriteria":         parsed_criteria,
        "parsingConfidence":      confidence,
        "totalPatientsEvaluated": len(patients_list),
        "eligibleCount":          len(ranked_patients) + 0,  # before location/score filters
        "filteredByLocation":     filtered_by_location,
        "rankedPatients":         ranked_patients,
        "disqualifiedPatients":   disqualified_patients,
        "processingTime":         f"{elapsed}s",
        "matchedAt":              timestamp,
    }


# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION 2: get_recruitment_summary
# ─────────────────────────────────────────────────────────────────────────────

def get_recruitment_summary(ranked_results: dict) -> dict:
    """
    Generate an aggregated recruitment summary for the doctor.

    Args:
        ranked_results: Output of match_patients_to_criteria().

    Returns:
        Summary dict with match counts, geographic breakdown, and insight.
    """
    patients = ranked_results.get("rankedPatients", [])

    if not patients:
        return {
            "totalCandidates": 0,
            "excellentMatches": 0,
            "goodMatches": 0,
            "partialMatches": 0,
            "topCandidate": None,
            "averageScore": 0,
            "geographicBreakdown": {},
            "recommendedForContact": [],
            "insight": "No eligible candidates found for the given criteria.",
        }

    excellent = [p for p in patients if p["finalScore"] >= 90]
    good      = [p for p in patients if 70 <= p["finalScore"] < 90]
    partial   = [p for p in patients if 50 <= p["finalScore"] < 70]

    avg_score = round(sum(p["finalScore"] for p in patients) / len(patients), 1)
    top       = patients[0]

    # Geographic breakdown
    geo: dict = {}
    for p in patients:
        city = _city(p.get("location", "Unknown")).title() or "Unknown"
        geo[city] = geo.get(city, 0) + 1

    # Recommend top scorers (score >= 70)
    recommended = [p["patientId"] for p in patients if p["finalScore"] >= 70]

    # Build insight sentence
    if excellent:
        top_city = _city(top.get("location", "")).title()
        insight = (
            f"{len(excellent)} excellent candidate(s) found"
            + (f" in {top_city}" if top_city else "")
            + f". Recommend contacting {top['patientId']} first "
            f"with {int(top['finalScore'])}% confidence score."
        )
    elif good:
        insight = (
            f"{len(good)} good match(es) found. "
            f"Top candidate {top['patientId']} scored {int(top['finalScore'])}%."
        )
    else:
        insight = (
            f"{len(patients)} partial match(es) found. "
            "Review criteria and consider broadening the age or lab value ranges."
        )

    return {
        "totalCandidates":       len(patients),
        "excellentMatches":      len(excellent),
        "goodMatches":           len(good),
        "partialMatches":        len(partial),
        "topCandidate":          top["patientId"],
        "averageScore":          avg_score,
        "geographicBreakdown":   geo,
        "recommendedForContact": recommended,
        "insight":               insight,
    }
