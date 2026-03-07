"""
dummy_data.py — Clinerva Dummy Patient + Trial Data
Raw (pre-anonymization) patient records and hardcoded clinical trial definitions.
Expanded: 15 patients, 12 trials across 6 disease categories.
"""

import json

# ─────────────────────────────────────────────
# RAW PATIENT RECORDS (15 patients)
# Categories: Diabetes, Cancer, Cardiac,
#             Neurological, Renal, Respiratory
# ─────────────────────────────────────────────

RAW_PATIENTS = [

    # ── DIABETES PATIENTS ──────────────────────────────────────────────────
    {
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
        "name": "Vikram Desai",
        "email": "vikram.desai@example.com",
        "phone": "9812345679",
        "age": 47,
        "gender": "Male",
        "diagnosis": "Type 2 Diabetes",
        "medications": ["Metformin", "Glipizide"],
        "labResults": {"HbA1c": 9.2, "eGFR": 55},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Pune, India",
    },
    {
        "name": "Meera Pillai",
        "email": "meera.pillai@example.com",
        "phone": "9812345680",
        "age": 61,
        "gender": "Female",
        "diagnosis": "Type 2 Diabetes",
        "medications": ["insulin"],
        "labResults": {"HbA1c": 10.5, "eGFR": 42},
        "smokingStatus": "Never",
        "surgicalHistory": "cardiac surgery",
        "location": "Chennai, India",
    },

    # ── CANCER PATIENTS ───────────────────────────────────────────────────
    {
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
        "name": "Sunita Rao",
        "email": "sunita.rao@example.com",
        "phone": "9823456790",
        "age": 38,
        "gender": "Female",
        "diagnosis": "Breast Cancer",
        "medications": ["Tamoxifen"],
        "labResults": {"CA125": 35.0, "HER2": "positive"},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Hyderabad, India",
    },
    {
        "name": "Aditya Kulkarni",
        "email": "aditya.kulkarni@example.com",
        "phone": "9823456791",
        "age": 55,
        "gender": "Male",
        "diagnosis": "Non-Small Cell Lung Cancer",
        "medications": ["Osimertinib"],
        "labResults": {"CEA": 8.1, "ALK_mutation": False, "EGFR_mutation": True},
        "smokingStatus": "Current",
        "surgicalHistory": "pneumonectomy",
        "location": "Bangalore, India",
    },

    # ── CARDIAC PATIENTS ──────────────────────────────────────────────────
    {
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
    {
        "name": "Suresh Iyer",
        "email": "suresh.iyer@example.com",
        "phone": "9834567891",
        "age": 63,
        "gender": "Male",
        "diagnosis": "Heart Failure",
        "medications": ["Carvedilol", "Furosemide"],
        "labResults": {
            "ejectionFraction": 35,
            "BNP": 450,
            "eGFR": 52,
            "systolicBP": 130,
        },
        "smokingStatus": "Former",
        "surgicalHistory": "None",
        "location": "Mumbai, India",
    },
    {
        "name": "Kavita Joshi",
        "email": "kavita.joshi@example.com",
        "phone": "9834567892",
        "age": 57,
        "gender": "Female",
        "diagnosis": "Hypertension",
        "medications": ["ACE inhibitors", "Hydrochlorothiazide"],
        "labResults": {"systolicBP": 162, "diastolicBP": 102, "eGFR": 65},
        "smokingStatus": "Never",
        "surgicalHistory": "valve replacement",
        "location": "Delhi, India",
    },

    # ── NEUROLOGICAL PATIENTS ─────────────────────────────────────────────
    {
        "name": "Ramesh Gupta",
        "email": "ramesh.gupta@example.com",
        "phone": "9845678901",
        "age": 68,
        "gender": "Male",
        "diagnosis": "Parkinson's Disease",
        "medications": ["Levodopa", "Carbidopa"],
        "labResults": {"MoCA_score": 24, "UPDRS_score": 32},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Kolkata, India",
    },
    {
        "name": "Lalitha Subramanian",
        "email": "lalitha.subramanian@example.com",
        "phone": "9845678902",
        "age": 72,
        "gender": "Female",
        "diagnosis": "Alzheimer's Disease",
        "medications": ["Donepezil", "Memantine"],
        "labResults": {"MMSE_score": 18, "CDR_score": 1.0},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Chennai, India",
    },

    # ── RENAL PATIENTS ────────────────────────────────────────────────────
    {
        "name": "Nikhil Banerjee",
        "email": "nikhil.banerjee@example.com",
        "phone": "9856789012",
        "age": 44,
        "gender": "Male",
        "diagnosis": "Chronic Kidney Disease",
        "medications": ["Erythropoietin", "Phosphate binders"],
        "labResults": {"eGFR": 28, "creatinine": 3.2, "hemoglobin": 9.5},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Mumbai, India",
    },

    # ── RESPIRATORY PATIENTS ──────────────────────────────────────────────
    {
        "name": "Deepa Menon",
        "email": "deepa.menon@example.com",
        "phone": "9867890123",
        "age": 50,
        "gender": "Female",
        "diagnosis": "Chronic Obstructive Pulmonary Disease",
        "medications": ["Tiotropium", "Salmeterol"],
        "labResults": {"FEV1_percent": 55, "FVC": 2.8, "DLCO": 60},
        "smokingStatus": "Former",
        "surgicalHistory": "None",
        "location": "Bangalore, India",
    },
    {
        "name": "Arjun Tiwari",
        "email": "arjun.tiwari@example.com",
        "phone": "9867890124",
        "age": 33,
        "gender": "Male",
        "diagnosis": "Asthma",
        "medications": ["Salbutamol", "Fluticasone"],
        "labResults": {"FEV1_percent": 70, "IgE": 320, "eosinophilCount": 550},
        "smokingStatus": "Never",
        "surgicalHistory": "None",
        "location": "Jaipur, India",
    },
]


# ─────────────────────────────────────────────
# CLINICAL TRIALS (12 trials)
# Categories: Diabetes (3), Cancer (3),
#             Cardiac (2), Neuro (2),
#             Renal (1), Respiratory (1)
# ─────────────────────────────────────────────

CLINICAL_TRIALS = [

    # ── DIABETES TRIALS ───────────────────────────────────────────────────
    {
        "trialId": "TRL-001",
        "name": "GLUCO-ADVANCE Phase 3 — Novel GLP-1 Agonist for Type 2 Diabetes",
        "phase": "Phase 3",
        "location": "Mumbai, India",
        "sponsor": "Clinerva Research Institute",
        "status": "Recruiting",
        "startDate": "2024-01-15",
        "endDate": "2025-12-31",
        "maxParticipants": 300,
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
        "trialId": "TRL-002-DIA",
        "name": "INSULIN-FREE Phase 2 — Oral Insulin Alternative for T2DM",
        "phase": "Phase 2",
        "location": "Pune, India",
        "sponsor": "DiabaCure Labs",
        "status": "Recruiting",
        "startDate": "2024-03-01",
        "endDate": "2025-06-30",
        "maxParticipants": 150,
        "criteria": {
            "inclusion": {
                "age": {"min": 35, "max": 70},
                "diagnosis": "Type 2 Diabetes",
                "HbA1c": {"min": 8.0, "max": 12.0},
                "eGFR": {"min": 40},
            },
            "exclusion": {
                "surgicalHistory": ["cardiac surgery"],
                "medications": [],
            },
        },
    },
    {
        "trialId": "TRL-003-DIA",
        "name": "BETA-RESTORE Phase 1 — Pancreatic Beta Cell Regeneration Study",
        "phase": "Phase 1",
        "location": "Delhi, India",
        "sponsor": "AIIMS Research Division",
        "status": "Open",
        "startDate": "2024-06-01",
        "endDate": "2025-05-31",
        "maxParticipants": 50,
        "criteria": {
            "inclusion": {
                "age": {"min": 30, "max": 60},
                "diagnosis": "Type 2 Diabetes",
                "HbA1c": {"min": 7.5, "max": 11.0},
                "smokingStatus": "Never",
                "eGFR": {"min": 50},
            },
            "exclusion": {
                "surgicalHistory": ["cardiac surgery", "pancreatectomy"],
                "medications": ["insulin"],
            },
        },
    },

    # ── CANCER TRIALS ──────────────────────────────────────────────────────
    {
        "trialId": "TRL-004-CAN",
        "name": "LUNG-MATCH Phase 2 — Targeted Immunotherapy for NSCLC",
        "phase": "Phase 2",
        "location": "Delhi, India",
        "sponsor": "OncoPath Pharmaceuticals",
        "status": "Recruiting",
        "startDate": "2024-02-01",
        "endDate": "2026-01-31",
        "maxParticipants": 200,
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
        "trialId": "TRL-005-CAN",
        "name": "BREAST-GUARD Phase 3 — HER2 Targeted Therapy for Breast Cancer",
        "phase": "Phase 3",
        "location": "Hyderabad, India",
        "sponsor": "OncoCare India",
        "status": "Recruiting",
        "startDate": "2024-04-01",
        "endDate": "2026-03-31",
        "maxParticipants": 400,
        "criteria": {
            "inclusion": {
                "age": {"min": 25, "max": 65},
                "diagnosis": "Breast Cancer",
                "HER2": "positive",
            },
            "exclusion": {
                "surgicalHistory": ["bilateral mastectomy"],
                "medications": ["Trastuzumab"],
            },
        },
    },
    {
        "trialId": "TRL-006-CAN",
        "name": "ONCO-SHIELD Phase 1 — PD-L1 Checkpoint Inhibitor Safety Study",
        "phase": "Phase 1",
        "location": "Bangalore, India",
        "sponsor": "ImmunoGen Research",
        "status": "Open",
        "startDate": "2024-07-01",
        "endDate": "2025-06-30",
        "maxParticipants": 60,
        "criteria": {
            "inclusion": {
                "age": {"min": 18, "max": 70},
                "diagnosis": "Non-Small Cell Lung Cancer",
                "smokingStatus": ["Never", "Former", "Current"],
            },
            "exclusion": {
                "surgicalHistory": ["pneumonectomy"],
                "medications": ["Osimertinib", "Chemotherapy"],
            },
        },
    },

    # ── CARDIAC TRIALS ────────────────────────────────────────────────────
    {
        "trialId": "TRL-007-CAR",
        "name": "CARDIO-FIRST Phase 1 — ARB Combination Therapy for Hypertension",
        "phase": "Phase 1",
        "location": "Pune, India",
        "sponsor": "HeartWell Clinical Labs",
        "status": "Open",
        "startDate": "2024-05-01",
        "endDate": "2025-04-30",
        "maxParticipants": 80,
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
    {
        "trialId": "TRL-008-CAR",
        "name": "HEART-RENEW Phase 2 — Stem Cell Therapy for Heart Failure",
        "phase": "Phase 2",
        "location": "Mumbai, India",
        "sponsor": "CardioRegen Institute",
        "status": "Recruiting",
        "startDate": "2024-03-15",
        "endDate": "2026-03-14",
        "maxParticipants": 120,
        "criteria": {
            "inclusion": {
                "age": {"min": 45, "max": 75},
                "diagnosis": "Heart Failure",
                "ejectionFraction": {"max": 40},
                "eGFR": {"min": 30},
            },
            "exclusion": {
                "surgicalHistory": ["cardiac bypass", "valve replacement"],
                "medications": [],
            },
        },
    },

    # ── NEUROLOGICAL TRIALS ───────────────────────────────────────────────
    {
        "trialId": "TRL-009-NEU",
        "name": "NEURO-MOVE Phase 2 — Neuroprotective Agent for Parkinson's",
        "phase": "Phase 2",
        "location": "Kolkata, India",
        "sponsor": "BrainCare Pharmaceuticals",
        "status": "Recruiting",
        "startDate": "2024-02-15",
        "endDate": "2026-02-14",
        "maxParticipants": 180,
        "criteria": {
            "inclusion": {
                "age": {"min": 50, "max": 80},
                "diagnosis": "Parkinson's Disease",
                "UPDRS_score": {"min": 20, "max": 50},
                "smokingStatus": "Never",
            },
            "exclusion": {
                "surgicalHistory": ["deep brain stimulation"],
                "medications": [],
            },
        },
    },
    {
        "trialId": "TRL-010-NEU",
        "name": "MEMO-GUARD Phase 3 — Anti-Amyloid Antibody for Alzheimer's",
        "phase": "Phase 3",
        "location": "Chennai, India",
        "sponsor": "NeuroCure Labs",
        "status": "Recruiting",
        "startDate": "2024-01-01",
        "endDate": "2026-12-31",
        "maxParticipants": 500,
        "criteria": {
            "inclusion": {
                "age": {"min": 60, "max": 85},
                "diagnosis": "Alzheimer's Disease",
                "MMSE_score": {"min": 15, "max": 26},
                "CDR_score": {"min": 0.5, "max": 2.0},
            },
            "exclusion": {
                "surgicalHistory": ["brain surgery"],
                "medications": [],
            },
        },
    },

    # ── RENAL TRIAL ───────────────────────────────────────────────────────
    {
        "trialId": "TRL-011-REN",
        "name": "RENAL-PROTECT Phase 2 — Novel EPO Mimetic for CKD Anaemia",
        "phase": "Phase 2",
        "location": "Mumbai, India",
        "sponsor": "NephroGen India",
        "status": "Recruiting",
        "startDate": "2024-04-01",
        "endDate": "2025-12-31",
        "maxParticipants": 160,
        "criteria": {
            "inclusion": {
                "age": {"min": 18, "max": 70},
                "diagnosis": "Chronic Kidney Disease",
                "eGFR": {"min": 15, "max": 45},
                "hemoglobin": {"min": 8.0, "max": 11.0},
            },
            "exclusion": {
                "surgicalHistory": ["kidney transplant"],
                "medications": [],
            },
        },
    },

    # ── RESPIRATORY TRIAL ─────────────────────────────────────────────────
    {
        "trialId": "TRL-012-RES",
        "name": "BREATHE-EASY Phase 2 — Biologic Therapy for Severe Asthma",
        "phase": "Phase 2",
        "location": "Jaipur, India",
        "sponsor": "RespiCare Biotech",
        "status": "Recruiting",
        "startDate": "2024-05-15",
        "endDate": "2026-05-14",
        "maxParticipants": 220,
        "criteria": {
            "inclusion": {
                "age": {"min": 18, "max": 65},
                "diagnosis": "Asthma",
                "eosinophilCount": {"min": 300},
                "FEV1_percent": {"min": 40, "max": 80},
                "smokingStatus": "Never",
            },
            "exclusion": {
                "surgicalHistory": [],
                "medications": [],
            },
        },
    },
]


# ─────────────────────────────────────────────
# Utility: pretty-print datasets
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  Clinerva — Dummy Data Overview")
    print("=" * 60)

    print(f"\n📋  Raw Patients ({len(RAW_PATIENTS)}):\n")
    categories = {}
    for i, p in enumerate(RAW_PATIENTS, 1):
        print(f"  {i:02d}. {p['name']:<25} | Age {p['age']:>2} | "
              f"{p['diagnosis']:<35} | {p['location']}")
        diag = p["diagnosis"]
        categories[diag] = categories.get(diag, 0) + 1

    print(f"\n  Disease breakdown:")
    for diag, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"    {diag}: {count} patient(s)")

    print(f"\n🧪  Clinical Trials ({len(CLINICAL_TRIALS)}):\n")
    for i, t in enumerate(CLINICAL_TRIALS, 1):
        print(f"  {i:02d}. [{t['trialId']:<14}] {t['name']}")
        print(f"       Phase: {t['phase']:<10} | "
              f"Location: {t['location']:<20} | "
              f"Status: {t['status']}")

    print(f"\n  Expected matches (rule-based preview):")
    print(f"    Ananya Sharma  → TRL-001 (Diabetes, Mumbai)")
    print(f"    Vikram Desai   → TRL-001, TRL-002-DIA (Diabetes)")
    print(f"    Rohan Mehta    → TRL-004-CAN (NSCLC, ALK+)")
    print(f"    Sunita Rao     → TRL-005-CAN (Breast Cancer, HER2+)")
    print(f"    Priya Nair     → TRL-007-CAR (Hypertension)")
    print(f"    Suresh Iyer    → TRL-008-CAR (Heart Failure)")
    print(f"    Ramesh Gupta   → TRL-009-NEU (Parkinson's)")
    print(f"    Lalitha S.     → TRL-010-NEU (Alzheimer's)")
    print(f"    Nikhil Banerjee→ TRL-011-REN (CKD)")
    print(f"    Arjun Tiwari   → TRL-012-RES (Asthma)")
    print()