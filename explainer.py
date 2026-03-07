"""
explainer.py — Clinerva SHAP Explainer (Real ML version)
Uses SHAP TreeExplainer to produce feature-level explanations.
Requires: shap, pandas, joblib
"""

import joblib
import pandas as pd
import shap

# ── Lazy-load ─────────────────────────────────────────────────────────────────
_model    = None
_scaler   = None
_explainer = None

def _load():
    global _model, _scaler, _explainer
    if _model is None:
        _model     = joblib.load("clinerva_model.pkl")
        _scaler    = joblib.load("clinerva_scaler.pkl")
        _explainer = shap.TreeExplainer(_model)


# ── Feature metadata ──────────────────────────────────────────────────────────

FEATURE_NAMES = [
    "age_score", "hba1c_score", "egfr_score",
    "diagnosis_match", "smoking_match",
    "location_score", "criteria_pass_ratio",
    "phase_compatibility",
]

FEATURE_LABELS = {
    "age_score":           "Age compatibility",
    "hba1c_score":         "HbA1c blood sugar level",
    "egfr_score":          "Kidney function (eGFR)",
    "diagnosis_match":     "Primary diagnosis",
    "smoking_match":       "Smoking status",
    "location_score":      "Geographic proximity",
    "criteria_pass_ratio": "Overall criteria match",
    "phase_compatibility": "Trial phase suitability",
}

POSITIVE_MEANINGS = {
    "age_score":           "Patient age is well-centred within the trial's accepted range",
    "hba1c_score":         "HbA1c level fits within the required range",
    "egfr_score":          "Kidney function is above the minimum threshold",
    "diagnosis_match":     "Exact diagnosis match strongly increases match probability",
    "smoking_match":       "Smoking history meets trial requirements",
    "location_score":      "Same city as trial site — reduces logistical burden",
    "criteria_pass_ratio": "High proportion of inclusion criteria met",
    "phase_compatibility": "Trial phase is a strong fit for this patient stage",
}

NEGATIVE_MEANINGS = {
    "age_score":           "Patient age is outside or near the boundary of the accepted range",
    "hba1c_score":         "HbA1c level is outside or near the accepted range",
    "egfr_score":          "Kidney function is below or close to the minimum threshold",
    "diagnosis_match":     "Diagnosis does not precisely match the trial requirement",
    "smoking_match":       "Smoking status does not meet the trial requirement",
    "location_score":      "Patient and trial are in different locations",
    "criteria_pass_ratio": "Several inclusion criteria were not met",
    "phase_compatibility": "Trial phase may not be optimal for this patient",
}

PATIENT_POSITIVE_LABELS = {
    "age_score":           "Your age is within the right range for this trial",
    "hba1c_score":         "Your blood sugar levels are a good fit",
    "egfr_score":          "Your kidney function meets the requirement",
    "diagnosis_match":     "Your diagnosis is an exact match for this trial",
    "smoking_match":       "Your smoking history meets the trial criteria",
    "location_score":      "The trial is in your city — very convenient",
    "criteria_pass_ratio": "You meet most of the trial requirements",
    "phase_compatibility": "The trial phase is suitable for your situation",
}

PATIENT_NEGATIVE_LABELS = {
    "age_score":           "Your age is near the boundary of what this trial accepts",
    "hba1c_score":         "Your blood sugar level is outside the ideal range",
    "egfr_score":          "Your kidney function is borderline for this trial",
    "diagnosis_match":     "Your diagnosis doesn't exactly match what this trial needs",
    "smoking_match":       "Your smoking history doesn't meet the trial requirement",
    "location_score":      "The trial is in a different city from you",
    "criteria_pass_ratio": "Some trial requirements were not met",
    "phase_compatibility": "This trial phase may not be the best fit",
}


# ── Main explain function ─────────────────────────────────────────────────────

def explain(patient: dict, trial: dict, score_result: dict) -> dict:
    """
    Generate SHAP-based explanations for a patient-trial match.

    Args:
        patient:      Anonymized patient dict.
        trial:        Clinical trial dict.
        score_result: Output of ml_scorer.calculate_score().

    Returns:
        Dict with 'doctorView' and 'patientView'.
    """
    _load()

    feature_vector = score_result.get("featureVector", {})
    final_score    = score_result.get("finalScore", 0)
    ml_prob        = score_result.get("mlProbability", 0)
    trial_id       = score_result.get("trialId", trial.get("trialId", "this trial"))
    patient_id     = score_result.get("patientId", patient.get("patientId", "UNKNOWN"))

    # ── SHAP computation ──────────────────────────────────────────────────────
    X = pd.DataFrame([feature_vector], columns=FEATURE_NAMES)
    X_scaled    = _scaler.transform(X)
    shap_values = _explainer.shap_values(X_scaled)

    # Handle both old SHAP (list of arrays) and new SHAP (3D ndarray)
    import numpy as np
    if isinstance(shap_values, list):
        # Old format: list[class_idx][sample_idx]
        shap_vals = shap_values[1][0]
    elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
        # New format: shape (n_samples, n_features, n_classes)
        shap_vals = shap_values[0, :, 1]
    else:
        # Fallback: assume (n_samples, n_features) already for class 1
        shap_vals = shap_values[0]

    shap_map = dict(zip(FEATURE_NAMES, shap_vals))

    # Sort features by SHAP value
    sorted_shap = sorted(shap_map.items(), key=lambda x: x[1], reverse=True)
    positive_feats = [(f, v) for f, v in sorted_shap if v > 0][:3]
    negative_feats = [(f, v) for f, v in sorted_shap if v < 0][-2:]   # most negative

    # ── Doctor View ───────────────────────────────────────────────────────────
    shap_explanation = []
    for feat, val in sorted_shap:
        direction = "positive" if val >= 0 else "negative"
        meaning   = POSITIVE_MEANINGS[feat] if val >= 0 else NEGATIVE_MEANINGS[feat]
        shap_explanation.append({
            "feature":   FEATURE_LABELS[feat],
            "impact":    f"{val:+.4f}",
            "direction": direction,
            "meaning":   meaning,
        })

    top_positive = [FEATURE_LABELS[f] for f, _ in positive_feats]
    top_negative = [FEATURE_LABELS[f] for f, _ in negative_feats]

    doctor_summary = (
        f"Patient {patient_id} scored {final_score}% for trial {trial_id}. "
        f"Model confidence: {int(ml_prob * 100)}%."
    )

    doctor_view = {
        "summary":            doctor_summary,
        "shapExplanation":    shap_explanation,
        "topPositiveFactors": top_positive,
        "topNegativeFactors": top_negative,
        "modelConfidence":    f"{int(ml_prob * 100)}%",
    }

    # ── Patient View ──────────────────────────────────────────────────────────
    score_int = int(final_score)
    if final_score >= 90:
        headline = f"Excellent news! You are a {score_int}% match!"
    elif final_score >= 70:
        headline = f"Great news! You are a {score_int}% match!"
    elif final_score >= 50:
        headline = f"You are a {score_int}% partial match for this trial."
    else:
        headline = f"You may not qualify for this trial ({score_int}% match)."

    what_helped = [
        f"[OK] {PATIENT_POSITIVE_LABELS[f]}"
        for f, _ in positive_feats
    ]

    what_hurt = [
        f"[!!] {PATIENT_NEGATIVE_LABELS[f]}"
        for f, _ in negative_feats
    ]

    # Build summary from top positive SHAP feature labels
    if positive_feats:
        top_label = PATIENT_POSITIVE_LABELS.get(positive_feats[0][0], "your health data")
        patient_summary = f"{top_label.capitalize()}, which makes you a strong candidate."
    else:
        patient_summary = "Your health data has been evaluated against the trial requirements."

    next_step = (
        "Talk to your doctor about applying for this trial."
        if not what_hurt
        else "Speak with your doctor — some factors may be addressable."
    )

    patient_view = {
        "headline":   headline,
        "summary":    patient_summary,
        "whatHelped": what_helped,
        "whatHurt":   what_hurt,
        "nextStep":   next_step,
    }

    return {
        "doctorView":  doctor_view,
        "patientView": patient_view,
    }
