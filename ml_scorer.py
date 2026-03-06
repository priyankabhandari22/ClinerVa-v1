"""
ml_scorer.py — Clinerva ML Scorer (Real ML version)
Loads trained Random Forest model and scores patient-trial pairs.
Blends ML probability with rule engine pass ratio for final score.
Requires: scikit-learn, joblib
"""

import os
import joblib

# ── Lazy-load model + scaler (loads once on first use) ───────────────────────
_model  = None
_scaler = None

def _load():
    global _model, _scaler
    if _model is None:
        _model  = joblib.load("clinerva_model.pkl")
        _scaler = joblib.load("clinerva_scaler.pkl")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _clamp(val, lo=0.0, hi=1.0):
    return max(lo, min(hi, val))


def _range_score(value, range_dict):
    """
    How centred is value inside a {min, max} range?
    Returns 0-1.  If only min supplied, uses a soft normalised score.
    """
    if value is None:
        return 0.0
    lo  = range_dict.get("min", None)
    hi  = range_dict.get("max", None)
    if lo is not None and hi is not None:
        midpoint   = (lo + hi) / 2
        range_size = hi - lo if hi != lo else 1
        return _clamp(1.0 - abs(value - midpoint) / range_size)
    elif lo is not None:
        # min-only criterion (e.g. eGFR ≥ 45) — normalise above threshold
        return _clamp((value - lo) / 50.0)
    return 0.5


def _nested_get(d, *keys):
    """Safely navigate nested dicts."""
    current = d
    for k in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(k)
    return current


def _phase_compat(phase):
    """Map phase string/int → 0-1 compatibility score."""
    mapping = {"1": 0.25, "2": 0.50, "3": 0.75, "4": 1.00,
               1: 0.25,   2: 0.50,   3: 0.75,   4: 1.00}
    if isinstance(phase, str):
        # Handle "Phase 3" format
        phase = phase.strip().split()[-1]
    return mapping.get(phase, 0.5)


def _location_score(patient_loc: str, trial_loc: str) -> float:
    p = [x.strip().lower() for x in patient_loc.split(",")]
    t = [x.strip().lower() for x in trial_loc.split(",")]
    if p[0] == t[0]:
        return 1.0          # same city
    if len(p) > 1 and len(t) > 1 and p[-1] == t[-1]:
        return 0.6          # same country (simplified — no state detection)
    return 0.3


def _categorize(score: float):
    if score >= 90:
        return "Excellent Match", "green"
    elif score >= 70:
        return "Good Match", "blue"
    elif score >= 50:
        return "Partial Match", "yellow"
    else:
        return "Poor Match", "red"


# ── Main scoring function ─────────────────────────────────────────────────────

def calculate_score(patient: dict, trial: dict, rule_result: dict) -> dict:
    """
    Score a patient-trial pair using the trained Random Forest model,
    then blend with the rule-engine pass ratio.

    Args:
        patient:     Anonymized patient dict.
        trial:       Clinical trial dict with criteria.
        rule_result: Output of rule_engine.check_eligibility().

    Returns:
        Score dict with mlProbability, mlScore, ruleScore,
        finalScore, featureVector, category, color.
    """
    _load()

    patient_id = patient.get("patientId", rule_result.get("patientId", "UNKNOWN"))
    trial_id   = trial.get("trialId", "UNKNOWN")

    inclusion = _nested_get(trial, "criteria", "inclusion") or {}
    lab       = patient.get("labResults", {})

    # ── Feature extraction ────────────────────────────────────────────────────

    # 1. age_score
    age_range = inclusion.get("age", {})
    age_score = _range_score(patient.get("age"), age_range) if age_range else 0.5

    # 2. hba1c_score
    hba1c_range = inclusion.get("HbA1c", {})
    hba1c_val   = lab.get("HbA1c") or lab.get("hba1c")
    hba1c_score = _range_score(hba1c_val, hba1c_range) if hba1c_range else 0.5

    # 3. egfr_score
    egfr_range = inclusion.get("eGFR", {})
    egfr_val   = lab.get("eGFR") or lab.get("egfr")
    if egfr_range and egfr_val is not None:
        egfr_score = _clamp((egfr_val - egfr_range.get("min", 0)) / 50.0)
    else:
        egfr_score = 0.5

    # 4. diagnosis_match
    patient_diag = (patient.get("diagnosis") or "").lower()
    trial_diag   = (inclusion.get("diagnosis") or "").lower()
    if patient_diag == trial_diag:
        diagnosis_match = 1.0
    elif patient_diag and trial_diag and (patient_diag in trial_diag or trial_diag in patient_diag):
        diagnosis_match = 0.7
    else:
        diagnosis_match = 0.0

    # 5. smoking_match
    patient_smoke  = (patient.get("smokingStatus") or "").strip()
    required_smoke = inclusion.get("smokingStatus")
    if required_smoke is None:
        smoking_match = 1.0
    elif isinstance(required_smoke, list):
        smoking_match = 1.0 if patient_smoke in required_smoke else 0.0
    else:
        smoking_match = 1.0 if patient_smoke == required_smoke else 0.0

    # 6. location_score
    patient_loc  = patient.get("location", "")
    trial_loc    = trial.get("location", "")
    loc_score    = _location_score(str(patient_loc), str(trial_loc))

    # 7. criteria_pass_ratio
    results_list = rule_result.get("results", [])
    total   = len(results_list)
    passed  = sum(1 for r in results_list if "PASS" in r.get("status", ""))
    pass_ratio = (passed / total) if total > 0 else 0.0

    # 8. phase_compatibility
    phase_compat = _phase_compat(trial.get("phase", 3))

    feature_vector = {
        "age_score":            round(age_score, 4),
        "hba1c_score":          round(hba1c_score, 4),
        "egfr_score":           round(egfr_score, 4),
        "diagnosis_match":      round(diagnosis_match, 4),
        "smoking_match":        round(smoking_match, 4),
        "location_score":       round(loc_score, 4),
        "criteria_pass_ratio":  round(pass_ratio, 4),
        "phase_compatibility":  round(phase_compat, 4),
    }

    # ── Scale and predict ─────────────────────────────────────────────────────
    features_ordered = [[
        feature_vector["age_score"],
        feature_vector["hba1c_score"],
        feature_vector["egfr_score"],
        feature_vector["diagnosis_match"],
        feature_vector["smoking_match"],
        feature_vector["location_score"],
        feature_vector["criteria_pass_ratio"],
        feature_vector["phase_compatibility"],
    ]]
    features_scaled  = _scaler.transform(features_ordered)
    ml_probability   = float(_model.predict_proba(features_scaled)[0][1])

    # ── Blend ─────────────────────────────────────────────────────────────────
    ml_score        = ml_probability * 100
    rule_pass_score = pass_ratio * 100
    final_score     = round((ml_score * 0.65) + (rule_pass_score * 0.35), 1)

    category, color = _categorize(final_score)

    return {
        "patientId":      patient_id,
        "trialId":        trial_id,
        "mlProbability":  round(ml_probability, 4),
        "mlScore":        round(ml_score, 1),
        "ruleScore":      round(rule_pass_score, 1),
        "finalScore":     final_score,
        "featureVector":  feature_vector,
        "category":       category,
        "color":          color,
    }
