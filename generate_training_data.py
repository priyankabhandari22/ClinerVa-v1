"""
generate_training_data.py — Clinerva ML Training Data Generator
Generates 500 realistic synthetic patient-trial match samples.
Pure Python + stdlib only (random, csv, math).
"""

import random
import csv
import math

random.seed(42)

FEATURE_NAMES = [
    "age_score", "hba1c_score", "egfr_score",
    "diagnosis_match", "smoking_match",
    "location_score", "criteria_pass_ratio",
    "phase_compatibility", "enrollment_success"
]

def clamp(val, lo=0.0, hi=1.0):
    return max(lo, min(hi, val))

def random_age_score():
    """Simulate how centered patient age is within a trial range."""
    return clamp(random.gauss(0.65, 0.25))

def random_hba1c_score():
    return clamp(random.gauss(0.60, 0.28))

def random_egfr_score():
    return clamp(random.gauss(0.55, 0.30))

def random_diagnosis_match():
    r = random.random()
    if r < 0.50:
        return 1.0   # exact match
    elif r < 0.70:
        return 0.7   # related condition
    else:
        return 0.0   # no match

def random_smoking_match():
    return 1.0 if random.random() < 0.65 else 0.0

def random_location_score():
    r = random.random()
    if r < 0.30:
        return 1.0   # same city
    elif r < 0.55:
        return 0.8   # same state
    elif r < 0.80:
        return 0.6   # same country
    else:
        return 0.3   # different country

def random_criteria_pass_ratio():
    return clamp(random.gauss(0.62, 0.25))

def random_phase_compatibility():
    phase_map = {1: 0.25, 2: 0.50, 3: 0.75, 4: 1.00}
    phase = random.choice([1, 2, 3, 3, 3, 4])   # Phase 3 overweighted (most common)
    return phase_map[phase]

def generate_label(criteria_pass_ratio, diagnosis_match, age_score, smoking_match):
    """Determine enrollment_success with realistic probabilistic logic."""
    # Hard rule: no diagnosis match → almost never enrolled
    if diagnosis_match == 0.0:
        return 1 if random.random() < 0.05 else 0

    if criteria_pass_ratio >= 0.8 and diagnosis_match == 1.0 and age_score >= 0.5:
        base_prob = 0.92
    elif criteria_pass_ratio >= 0.7 and diagnosis_match >= 0.7:
        base_prob = 0.72
    elif criteria_pass_ratio >= 0.6:
        base_prob = 0.45
    else:
        base_prob = 0.12

    # Smoking mismatch penalty
    if smoking_match == 0.0:
        base_prob -= 0.15

    # Add noise ±0.10 (tighter than before)
    prob = max(0.0, min(1.0, base_prob + random.uniform(-0.10, 0.10)))
    return 1 if random.random() < prob else 0


def generate():
    samples = []
    for _ in range(500):
        age_score            = random_age_score()
        hba1c_score          = random_hba1c_score()
        egfr_score           = random_egfr_score()
        diagnosis_match      = random_diagnosis_match()
        smoking_match        = random_smoking_match()
        location_score       = random_location_score()
        criteria_pass_ratio  = random_criteria_pass_ratio()
        phase_compatibility  = random_phase_compatibility()
        enrollment_success   = generate_label(criteria_pass_ratio, diagnosis_match, age_score, smoking_match)

        samples.append([
            round(age_score, 4),
            round(hba1c_score, 4),
            round(egfr_score, 4),
            round(diagnosis_match, 4),
            round(smoking_match, 4),
            round(location_score, 4),
            round(criteria_pass_ratio, 4),
            round(phase_compatibility, 4),
            enrollment_success,
        ])

    with open("training_data.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(FEATURE_NAMES)
        writer.writerows(samples)

    enrolled     = sum(s[-1] for s in samples)
    not_enrolled = 500 - enrolled
    print(f"Generated 500 training samples")
    print(f"Class distribution: {enrolled} enrolled, {not_enrolled} not enrolled")
    print(f"Saved to training_data.csv")


if __name__ == "__main__":
    generate()
