"""
data_layer.py — Clinerva Patient Data Layer
Provides patient anonymization utilities and automated tests.
Only uses: hashlib, datetime, json (stdlib only)
"""

import hashlib
import json
from datetime import datetime, timezone


# ─────────────────────────────────────────────
# TASK 1 — Patient Anonymizer
# ─────────────────────────────────────────────

def anonymize_patient(patient_data: dict) -> dict:
    """
    Anonymize raw patient data by stripping PII and generating
    a deterministic Clinerva Patient ID.

    Args:
        patient_data: Raw patient dict containing PII fields.

    Returns:
        Anonymized dict with patientId and anonymizedAt timestamp.
        Fields removed: name, email, phone.
    """
    # Extract PII for ID generation before removal
    name = patient_data.get("name", "")
    email = patient_data.get("email", "")

    # Generate deterministic patient ID: CLN- + first 8 hex chars of SHA-256(name+email)
    raw_key = (name + email).encode("utf-8")
    sha256_hex = hashlib.sha256(raw_key).hexdigest()
    patient_id = "CLN-" + sha256_hex[:8].upper()

    # Copy data, removing all PII fields
    PII_FIELDS = {"name", "email", "phone"}
    anonymized = {k: v for k, v in patient_data.items() if k not in PII_FIELDS}

    # Inject generated fields
    anonymized["patientId"] = patient_id
    anonymized["anonymizedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

    return anonymized


# ─────────────────────────────────────────────
# TASK 3 — Tests
# ─────────────────────────────────────────────

def _run_tests():
    """Run 3 automated test cases and print PASS/FAIL for each."""

    # Shared test patient
    test_patient = {
        "name": "John Doe",
        "email": "john@gmail.com",
        "phone": "9876543210",
        "age": 52,
        "gender": "Male",
        "diagnosis": "Type 2 Diabetes",
        "medications": ["Metformin"],
        "labResults": {"HbA1c": 7.8, "eGFR": 65},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Mumbai, India",
    }

    result = anonymize_patient(test_patient)

    print("\n" + "=" * 52)
    print("   Clinerva Data Layer — Anonymizer Test Results")
    print("=" * 52)

    # ── Test 1: PII fields are removed ──────────────────────
    pii_present = any(k in result for k in ("name", "email", "phone"))
    status1 = "FAIL" if pii_present else "PASS"
    print(f"\n[{status1}] Test 1 — No PII fields in output")
    if pii_present:
        found = [k for k in ("name", "email", "phone") if k in result]
        print(f"       DETAIL: PII still present → {found}")

    # ── Test 2: patientId starts with "CLN-" ────────────────
    pid = result.get("patientId", "")
    status2 = "PASS" if pid.startswith("CLN-") else "FAIL"
    print(f"[{status2}] Test 2 — patientId starts with 'CLN-'")
    print(f"       DETAIL: Generated ID -> {pid}")

    # ── Test 3: Medical data preserved ──────────────────────
    medical_ok = (
        result.get("age") == 52
        and result.get("diagnosis") == "Type 2 Diabetes"
        and result.get("medications") == ["Metformin"]
        and result.get("labResults") == {"HbA1c": 7.8, "eGFR": 65}
        and result.get("smokingStatus") == "Never"
        and result.get("location") == "Mumbai, India"
    )
    status3 = "PASS" if medical_ok else "FAIL"
    print(f"[{status3}] Test 3 — Medical data preserved after anonymization")

    print("\n" + "-" * 52)
    all_pass = all(s == "PASS" for s in (status1, status2, status3))
    print(f"   Overall: {'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}")
    print("=" * 52 + "\n")

    # Print the anonymized result for inspection
    print("Sample anonymized output:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    _run_tests()
