"""
test_reverse_engine.py — Tests for Clinerva Reverse Matching Engine
Runs 5 ordered tests against match_patients_to_criteria and get_recruitment_summary.
"""

import json
from dummy_data import RAW_PATIENTS
from reverse_rule_engine import match_patients_to_criteria, get_recruitment_summary

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
        import traceback
        print(f"[FAIL] {label}")
        print(f"       ERROR: {e}")
        traceback.print_exc()
        failures += 1

print("\n" + "=" * 58)
print("   Clinerva Reverse Engine - Test Suite")
print("=" * 58 + "\n")

# ── Shared criteria ───────────────────────────────────────────────────────────
DIABETES_CRITERIA = {
    "inclusion": {
        "age":           {"min": 40, "max": 65},
        "diagnosis":     "Type 2 Diabetes",
        "HbA1c":         {"min": 7.0, "max": 10.0},
        "smokingStatus": "Never",
        "eGFR":          {"min": 45},
        "location":      "Mumbai, India",
    },
    "exclusion": {
        "surgicalHistory_excluded": ["cardiac surgery"],
        "medications_excluded":     ["insulin"],
    },
    "parsingConfidence": 0.95,
    "rawInput": "Diabetes trial criteria",
}

# ── Test 1: Good criteria, multiple matches ───────────────────────────────────
def test_good_criteria():
    result = match_patients_to_criteria(DIABETES_CRITERIA, RAW_PATIENTS)
    ranked = result["rankedPatients"]

    assert result["eligibleCount"] >= 1, \
        f"Expected eligibleCount >= 1, got {result['eligibleCount']}"

    assert len(ranked) >= 1, f"Expected at least 1 ranked patient, got {len(ranked)}"

    top_score = ranked[0]["finalScore"]
    assert top_score > 60, f"Expected top score > 60, got {top_score}"

    # Sorted descending
    scores = [p["finalScore"] for p in ranked]
    assert scores == sorted(scores, reverse=True), "Results are not sorted descending by score"

    print(f"       eligibleCount={result['eligibleCount']}, "
          f"topScore={top_score}, processingTime={result['processingTime']}")

run_test("Good criteria, multiple matches -> ranked descending", test_good_criteria)

# ── Test 2: Strict/rare criteria, no matches ──────────────────────────────────
def test_no_matches():
    strict_criteria = {
        "inclusion": {
            "age":       {"min": 20, "max": 25},
            "diagnosis": "Rare Tropical Fever",
        },
        "exclusion": {},
        "parsingConfidence": 0.9,
        "rawInput": "Strict rare criteria",
    }
    result = match_patients_to_criteria(strict_criteria, RAW_PATIENTS)
    assert result["eligibleCount"] == 0, \
        f"Expected 0 eligible, got {result['eligibleCount']}"
    assert len(result["rankedPatients"]) == 0
    print(f"       eligibleCount=0 confirmed, "
          f"disqualified={len(result['disqualifiedPatients'])}")

run_test("Strict/rare criteria -> 0 matches", test_no_matches)

# ── Test 3: Location filter applied ──────────────────────────────────────────
def test_location_filter():
    result = match_patients_to_criteria(
        DIABETES_CRITERIA, RAW_PATIENTS, location_filter="Mumbai"
    )
    ranked = result["rankedPatients"]
    for p in ranked:
        city = p["location"].split(",")[0].strip().lower()
        assert city == "mumbai", \
            f"Expected only Mumbai patients, found '{p['location']}'"
    print(f"       All {len(ranked)} result(s) are in Mumbai")

run_test("Location filter='Mumbai' -> only Mumbai patients", test_location_filter)

# ── Test 4: Min score filter ──────────────────────────────────────────────────
def test_min_score_filter():
    MIN = 50.0
    result = match_patients_to_criteria(
        DIABETES_CRITERIA, RAW_PATIENTS, min_score=MIN
    )
    ranked = result["rankedPatients"]
    for p in ranked:
        assert p["finalScore"] >= MIN, \
            f"Patient {p['patientId']} has score {p['finalScore']} < min {MIN}"
    print(f"       {len(ranked)} patient(s) all have score >= {MIN}")

run_test(f"min_score=50 filter -> all results >= 50", test_min_score_filter)

# ── Test 5: Recruitment summary ───────────────────────────────────────────────
def test_recruitment_summary():
    result  = match_patients_to_criteria(DIABETES_CRITERIA, RAW_PATIENTS)
    summary = get_recruitment_summary(result)

    assert "topCandidate" in summary, "Missing 'topCandidate' in summary"
    assert "insight" in summary,      "Missing 'insight' in summary"
    assert isinstance(summary["geographicBreakdown"], dict)
    assert isinstance(summary["averageScore"], float)

    print(f"       topCandidate={summary['topCandidate']}, "
          f"avgScore={summary['averageScore']}")
    print(f"       insight: {summary['insight']}")

run_test("Recruitment summary has topCandidate and insight", test_recruitment_summary)

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "-" * 58)
print(f"   Results: {passes}/5 tests passed")
print(f"   Overall: {'ALL TESTS PASSED' if failures == 0 else 'SOME TESTS FAILED'}")
print("=" * 58 + "\n")
