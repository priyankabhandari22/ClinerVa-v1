"""
dummy_data.py — Clinerva Dummy Patient + Trial Data
Raw (pre-anonymization) patient records and hardcoded clinical trial definitions.
"""

import json

# ─────────────────────────────────────────────
# TASK 2 — Raw Patient Records (before anonymization)
# ─────────────────────────────────────────────

RAW_PATIENTS = [
    {
        # Patient 1 — Type 2 Diabetes, Mumbai
        "name": "Ananya Sharma",
        "email": "ananya.sharma@example.com",
        "phone": "9812345678",
        "age": 52,
        "gender": "Female",
        "diagnosis": "Type 2 Diabetes",
        "medications": ["Metformin"],
        "labResults": {"HbA1c": 8.1, "eGFR": 60},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Mumbai, India",
    },
    {
        # Patient 2 — Non-Small Cell Lung Cancer, Delhi
        "name": "Rohan Mehta",
        "email": "rohan.mehta@example.com",
        "phone": "9823456789",
        "age": 45,
        "gender": "Male",
        "diagnosis": "Non-Small Cell Lung Cancer",
        "medications": ["Carboplatin", "Paclitaxel"],
        "labResults": {"CEA": 12.4, "ALK_mutation": True},
        "smokingStatus": "Former",
        "surgicalHistory": "None",
        "location": "Delhi, India",
    },
    {
        # Patient 3 — Hypertension, Pune
        "name": "Priya Nair",
        "email": "priya.nair@example.com",
        "phone": "9834567890",
        "age": 38,
        "gender": "Female",
        "diagnosis": "Hypertension",
        "medications": ["Amlodipine"],
        "labResults": {"systolicBP": 155, "diastolicBP": 95, "eGFR": 78},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Pune, India",
    },
]

# ─────────────────────────────────────────────
# TASK 2 — Clinical Trials (hardcoded JSON, no parsing)
# ─────────────────────────────────────────────

CLINICAL_TRIALS = [
    {
        "trialId": "TRL-001",
        "name": "GLUCO-ADVANCE Phase 3 — Novel GLP-1 Agonist for Type 2 Diabetes",
        "phase": "Phase 3",
        "location": "Mumbai, India",
        "sponsor": "Clinerva Research Institute",
        "status": "Recruiting",
        "criteria": {
            "inclusion": {
                "age": {"min": 40, "max": 65},
                "diagnosis": "Type 2 Diabetes",
                "HbA1c": {"min": 7.0, "max": 10.0},
                "smokingStatus": "Never",
                "eGFR": {"min": 45},
            },
            "exclusion": {
                "surgicalHistory": ["cardiac surgery"],
                "medications": ["insulin"],
            },
        },
    },
    {
        "trialId": "TRL-002",
        "name": "LUNG-MATCH Phase 2 — Targeted Immunotherapy for NSCLC",
        "phase": "Phase 2",
        "location": "Delhi, India",
        "sponsor": "OncoPath Pharmaceuticals",
        "status": "Recruiting",
        "criteria": {
            "inclusion": {
                "age": {"min": 30, "max": 70},
                "diagnosis": "Non-Small Cell Lung Cancer",
                "ALK_mutation": True,
                "smokingStatus": ["Never", "Former"],
            },
            "exclusion": {
                "surgicalHistory": ["pneumonectomy"],
                "medications": ["Osimertinib"],
            },
        },
    },
    {
        "trialId": "TRL-003",
        "name": "CARDIO-FIRST Phase 1 — ARB Combination Therapy for Hypertension",
        "phase": "Phase 1",
        "location": "Pune, India",
        "sponsor": "HeartWell Clinical Labs",
        "status": "Open",
        "criteria": {
            "inclusion": {
                "age": {"min": 25, "max": 60},
                "diagnosis": "Hypertension",
                "systolicBP": {"min": 140},
                "eGFR": {"min": 60},
            },
            "exclusion": {
                "surgicalHistory": ["cardiac bypass", "valve replacement"],
                "medications": ["ACE inhibitors"],
            },
        },
    },
]


# ─────────────────────────────────────────────
# Utility: pretty-print datasets (for manual inspection)
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 52)
    print("  Clinerva — Dummy Data Overview")
    print("=" * 52)

    print(f"\n📋  Raw Patients ({len(RAW_PATIENTS)}):\n")
    for i, p in enumerate(RAW_PATIENTS, 1):
        print(f"  {i}. {p['name']} | Age {p['age']} | {p['diagnosis']} | {p['location']}")

    print(f"\n🧪  Clinical Trials ({len(CLINICAL_TRIALS)}):\n")
    for i, t in enumerate(CLINICAL_TRIALS, 1):
        print(f"  {i}. [{t['trialId']}] {t['name']}")
        print(f"     Phase: {t['phase']} | Location: {t['location']} | Status: {t['status']}")

    print("\n" + json.dumps(CLINICAL_TRIALS[0], indent=2))
