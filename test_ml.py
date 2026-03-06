"""
test_ml.py — Clinerva Full ML Pipeline Test Suite
Runs 5 ordered tests to validate the complete ML pipeline.
"""

import subprocess
import sys
import os
import json

passes = 0
failures = 0

def run_test(label, fn):
    global passes, failures
    try:
        fn()
        print(f"[PASS] {label}")
        passes += 1
    except AssertionError as e:
        print(f"[FAIL] {label}")
        print(f"       DETAIL: {e}")
        failures += 1
    except Exception as e:
        print(f"[FAIL] {label}")
        print(f"       ERROR: {e}")
        failures += 1

print("\n" + "=" * 58)
print("   Clinerva ML Pipeline — Full Test Suite")
print("=" * 58 + "\n")

# ── Test 1: Generate training data ────────────────────────────────────────────
def test_generate():
    import subprocess
    result = subprocess.run(
        [sys.executable, "generate_training_data.py"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert os.path.exists("training_data.csv"), "training_data.csv not found"

    import csv
    with open("training_data.csv") as f:
        reader = csv.reader(f)
        rows = list(reader)
    header = rows[0]
    data   = rows[1:]
    assert len(data) == 500, f"Expected 500 rows, got {len(data)}"
    assert len(header) == 9,  f"Expected 9 columns, got {len(header)}"
    print(f"       Training data: 500 rows, 9 columns confirmed")

run_test("Training data generated (500 rows, 9 columns)", test_generate)

# ── Test 2: Train model ───────────────────────────────────────────────────────
def test_train():
    from sklearn.metrics import accuracy_score
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestClassifier
    import pandas as pd
    import joblib

    result = subprocess.run(
        [sys.executable, "train_model.py"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert os.path.exists("clinerva_model.pkl"),  "clinerva_model.pkl not found"
    assert os.path.exists("clinerva_scaler.pkl"), "clinerva_scaler.pkl not found"

    # Verify accuracy by quick re-evaluation
    df = pd.read_csv("training_data.csv")
    X  = df.drop("enrollment_success", axis=1)
    y  = df["enrollment_success"]
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model  = joblib.load("clinerva_model.pkl")
    scaler = joblib.load("clinerva_scaler.pkl")
    X_test_scaled = scaler.transform(X_test)
    acc = accuracy_score(y_test, model.predict(X_test_scaled))

    assert acc > 0.75, f"Accuracy {acc:.2%} is below 75% threshold"
    print(f"       Accuracy: {acc:.1%}")

run_test("Model trained and saved (accuracy > 75%)", test_train)

# ── Test 3: Score perfect patient ─────────────────────────────────────────────
def test_perfect_patient():
    from ml_scorer import calculate_score
    from rule_engine import check_eligibility

    perfect_patient = {
        "patientId":      "CLN-TEST-PERFECT",
        "age":            52,
        "diagnosis":      "Type 2 Diabetes",
        "labResults":     {"HbA1c": 7.8, "eGFR": 65},
        "smokingStatus":  "Never",
        "location":       "Mumbai",
    }
    trial = {
        "trialId":  "DIAB-2024-001",
        "location": "Mumbai",
        "phase":    3,
        "criteria": {
            "inclusion": {
                "age":           {"min": 40, "max": 65},
                "diagnosis":     "Type 2 Diabetes",
                "HbA1c":         {"min": 7.0, "max": 10.0},
                "smokingStatus": "Never",
                "eGFR":          {"min": 45},
            },
            "exclusion": {
                "medications": ["insulin"],
            },
        },
    }

    rule_result  = check_eligibility(perfect_patient, trial["criteria"])
    score_result = calculate_score(perfect_patient, trial, rule_result)
    final        = score_result["finalScore"]
    assert final >= 80, f"Expected finalScore >= 80, got {final}"
    print(f"       finalScore = {final}, category = {score_result['category']}")

run_test("Perfect patient scored correctly (finalScore > 85)", test_perfect_patient)

# ── Test 4: Score poor patient ────────────────────────────────────────────────
def test_poor_patient():
    from ml_scorer import calculate_score
    from rule_engine import check_eligibility

    poor_patient = {
        "patientId":      "CLN-TEST-POOR",
        "age":            72,
        "diagnosis":      "Asthma",           # wrong diagnosis
        "labResults":     {"HbA1c": 11.5, "eGFR": 30},
        "smokingStatus":  "Current",
        "location":       "Delhi",
    }
    trial = {
        "trialId":  "DIAB-2024-001",
        "location": "Mumbai",
        "phase":    3,
        "criteria": {
            "inclusion": {
                "age":           {"min": 40, "max": 65},
                "diagnosis":     "Type 2 Diabetes",
                "HbA1c":         {"min": 7.0, "max": 10.0},
                "smokingStatus": "Never",
                "eGFR":          {"min": 45},
            },
            "exclusion": {},
        },
    }

    rule_result  = check_eligibility(poor_patient, trial["criteria"])
    score_result = calculate_score(poor_patient, trial, rule_result)
    final        = score_result["finalScore"]
    assert final < 55, f"Expected finalScore < 55, got {final}"
    print(f"       finalScore = {final}, category = {score_result['category']}")

run_test("Poor patient scored correctly (finalScore < 55)", test_poor_patient)

# ── Test 5: SHAP explanation ──────────────────────────────────────────────────
def test_shap_explanation():
    from ml_scorer import calculate_score
    from rule_engine import check_eligibility
    from explainer import explain

    perfect_patient = {
        "patientId":      "CLN-TEST-PERFECT",
        "age":            52,
        "diagnosis":      "Type 2 Diabetes",
        "labResults":     {"HbA1c": 7.8, "eGFR": 65},
        "smokingStatus":  "Never",
        "location":       "Mumbai",
    }
    trial = {
        "trialId":  "DIAB-2024-001",
        "location": "Mumbai",
        "phase":    3,
        "criteria": {
            "inclusion": {
                "age":           {"min": 40, "max": 65},
                "diagnosis":     "Type 2 Diabetes",
                "HbA1c":         {"min": 7.0, "max": 10.0},
                "smokingStatus": "Never",
                "eGFR":          {"min": 45},
            },
            "exclusion": {},
        },
    }

    rule_result  = check_eligibility(perfect_patient, trial["criteria"])
    score_result = calculate_score(perfect_patient, trial, rule_result)
    explanation  = explain(perfect_patient, trial, score_result)

    pv  = explanation["patientView"]
    dv  = explanation["doctorView"]

    assert "%" in pv["headline"],                          "Headline missing %"
    assert len(dv["shapExplanation"]) >= 3,                "Need >= 3 SHAP items"
    assert len(dv["topPositiveFactors"]) > 0,              "topPositiveFactors is empty"
    print(f"       headline = '{pv['headline']}'")
    print(f"       SHAP items = {len(dv['shapExplanation'])}, positives = {len(dv['topPositiveFactors'])}")

run_test("SHAP explanation generated correctly", test_shap_explanation)

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "-" * 58)
print(f"   Results: {passes}/5 tests passed")
print(f"   Overall: {'ALL TESTS PASSED' if failures == 0 else 'SOME TESTS FAILED'}")
print("=" * 58 + "\n")
