"""
test_parser.py — Clinerva Gemini Parser Test Suite
Tests 5 clinical trial criteria texts against the parser.
Falls back gracefully if GEMINI_API_KEY is not set.
"""

import json
import os
from gemini_parser import parse_criteria, validate_parsed_criteria, fallback_parser

HAS_GEMINI = bool(os.getenv("GEMINI_API_KEY"))
parse_fn = parse_criteria if HAS_GEMINI else fallback_parser

if not HAS_GEMINI:
    print("\n[NOTE] GEMINI_API_KEY not set — running all tests with regex fallback.\n")

CRITERIA_TEXTS = {
    "TEXT 1 — Diabetes Trial": (
        "Patients must be aged between 40 to 65 years. "
        "Must have Type 2 Diabetes diagnosis for at least 2 years. "
        "HbA1c levels between 7.0 and 10.0. "
        "Non-smokers only. No prior cardiac surgery. "
        "eGFR must be greater than 45. Currently not on insulin therapy. "
        "Trial located in Mumbai."
    ),
    "TEXT 2 — Cancer Trial": (
        "Adult patients aged 18-70 with confirmed Stage 2 or Stage 3 Lung Cancer. "
        "Must not have received prior chemotherapy. BMI between 18-35. "
        "No active infections. Located in Delhi or Mumbai."
    ),
    "TEXT 3 — Cardiac Trial": (
        "Patients aged 50-75 with chronic Heart Failure. "
        "Ejection fraction less than 40%. No recent cardiac surgery in past 6 months. "
        "eGFR above 30. Non-smokers preferred."
    ),
    "TEXT 4 — Vague/Incomplete": (
        "Looking for diabetic patients in good health."
    ),
    "TEXT 5 — Complex Multi-Condition": (
        "Patients aged 45-65 with Type 2 Diabetes AND Hypertension. "
        "HbA1c between 7-9. Blood pressure 130-160 systolic. "
        "BMI under 35. No kidney disease. Must be on Metformin therapy."
    ),
}

# Expected minimum criteria for each test (used for lightweight validation)
EXPECTATIONS = {
    "TEXT 1 — Diabetes Trial": {
        "inclusion_keys": ["age", "diagnosis", "HbA1c", "eGFR", "smokingStatus"],
        "min_confidence": 0.60,
    },
    "TEXT 2 — Cancer Trial": {
        "inclusion_keys": ["age", "diagnosis"],
        "min_confidence": 0.60,
    },
    "TEXT 3 — Cardiac Trial": {
        "inclusion_keys": ["age", "diagnosis"],
        "min_confidence": 0.60,
    },
    "TEXT 4 — Vague/Incomplete": {
        "inclusion_keys": [],              # expect low/empty
        "min_confidence": 0.0,            # any confidence accepted
        "expect_low_coverage": True,
    },
    "TEXT 5 — Complex Multi-Condition": {
        "inclusion_keys": ["age", "diagnosis"],
        "min_confidence": 0.60,
    },
}

print("\n" + "=" * 64)
print("   Clinerva Gemini Parser — Test Suite")
print(f"   Mode: {'Gemini API' if HAS_GEMINI else 'Regex Fallback'}")
print("=" * 64)

passed = 0
failed = 0

for label, criteria_text in CRITERIA_TEXTS.items():
    print(f"\n{'-' * 64}")
    print(f"  {label}")
    print(f"{'-' * 64}")

    try:
        parsed  = parse_fn(criteria_text)
        result  = validate_parsed_criteria(parsed)
        expect  = EXPECTATIONS[label]

        inclusion   = parsed.get("inclusion", {})
        confidence  = parsed.get("parsingConfidence", 0)
        coverage    = result.get("criteriaCoverage", "low")

        # Evaluate expectations
        missing_keys = [k for k in expect["inclusion_keys"] if k not in inclusion]
        low_coverage_ok = expect.get("expect_low_coverage", False) and coverage in ("low", "medium")
        key_check_ok = (
            len(missing_keys) == 0
            or expect.get("expect_low_coverage", False)   # vague text allowed to miss keys
        )
        confidence_ok = confidence >= expect["min_confidence"]

        test_ok = key_check_ok and confidence_ok

        status = "[PASS]" if test_ok else "[FAIL]"
        print(f"  {status} parsedBy={parsed.get('parsedBy')}")
        print(f"         confidence={confidence}  coverage={coverage}")
        print(f"         inclusion keys: {list(inclusion.keys())}")
        if result["warnings"]:
            print(f"         warnings: {result['warnings']}")
        if missing_keys:
            print(f"         missing expected keys: {missing_keys}")

        # Pretty-print inclusion + exclusion
        print("\n  Parsed output:")
        print(json.dumps({"inclusion": inclusion, "exclusion": parsed.get("exclusion", {})}, indent=4))

        if test_ok:
            passed += 1
        else:
            failed += 1

    except Exception as e:
        print(f"  [FAIL] Exception: {e}")
        failed += 1

print("\n" + "=" * 64)
print(f"   Results: {passed}/{passed + failed} tests passed")
print(f"   Overall: {'ALL TESTS PASSED' if failed == 0 else 'SOME TESTS FAILED'}")
print("=" * 64 + "\n")
