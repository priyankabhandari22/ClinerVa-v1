"""
gemini_parser.py — Clinerva Clinical Trial Criteria Parser
Converts raw eligibility text into structured JSON using Google Gemini.
Falls back to regex-based parsing if Gemini is unavailable or fails.

Requirements:
  pip install google-generativeai python-dotenv
"""

import os
import re
import json
from datetime import datetime, timezone

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import google.genai as genai
from google.genai import types as genai_types

# Configure Gemini (will raise if key is missing at call time)
def _get_client():
    """Return a configured Gemini client (lazy-initialised)."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY not set. Add it to your .env file or environment variables."
        )
    return genai.Client(api_key=api_key)


# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION 1: parse_criteria
# ─────────────────────────────────────────────────────────────────────────────

GEMINI_PROMPT_TEMPLATE = """\
You are a medical AI assistant for a clinical trial matching system called Clinerva.

Your job is to convert clinical trial eligibility criteria text into a strict structured JSON object.

Rules:
- Extract ALL numeric ranges with min/max
- Extract ALL required medical conditions
- Extract ALL exclusion criteria
- Extract geographic location if mentioned
- Extract trial phase if mentioned
- Use ONLY these exact field names:
  age, diagnosis, HbA1c, eGFR, bloodPressure,
  smokingStatus, bmi, gender,
  diagnosisDurationYears, medications_required,
  medications_excluded, surgicalHistory_excluded,
  conditions_excluded, location, phase

Return ONLY a valid JSON object.
No explanation. No markdown. No backticks.
Just raw JSON.

Criteria text:
{criteria_text}
"""


def parse_criteria(criteria_text: str) -> dict:
    """
    Parse raw eligibility criteria text into structured JSON using Gemini.
    Falls back to regex parsing if Gemini fails or is unavailable.

    Args:
        criteria_text: Raw clinical trial eligibility text.

    Returns:
        Structured dict with inclusion/exclusion keys and metadata.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    used_fallback = False

    try:
        client   = _get_client()
        prompt   = GEMINI_PROMPT_TEMPLATE.format(criteria_text=criteria_text)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        raw_text = response.text.strip()

        # Strip markdown code fences if Gemini wraps the response
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.IGNORECASE)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        raw_text = raw_text.strip()

        gemini_parsed = json.loads(raw_text)

        # Normalise into inclusion / exclusion structure if Gemini returned flat
        inclusion = {}
        exclusion = {}

        EXCLUSION_KEYS = {
            "medications_excluded", "surgicalHistory_excluded",
            "conditions_excluded",
        }

        for key, val in gemini_parsed.items():
            if key in EXCLUSION_KEYS:
                exclusion[key] = val
            else:
                inclusion[key] = val

        parsed = {
            "parsedBy":          "gemini-2.0-flash-exp",
            "parsingConfidence": 0.95,
            "rawInput":          criteria_text,
            "parsedAt":          timestamp,
            "inclusion":         inclusion,
            "exclusion":         exclusion,
        }

    except json.JSONDecodeError:
        # Gemini responded but returned invalid JSON — use regex fallback
        parsed = fallback_parser(criteria_text)
        parsed["parsedBy"] = "gemini-2.0-flash-exp (json_failed→fallback)"
        parsed["parsedAt"] = timestamp
        used_fallback = True

    except Exception:
        # API error, no key, network issue — fall back silently
        parsed = fallback_parser(criteria_text)
        parsed["parsedAt"] = timestamp
        used_fallback = True

    return parsed


# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION 2: fallback_parser
# ─────────────────────────────────────────────────────────────────────────────

KNOWN_CONDITIONS = [
    "Type 2 Diabetes", "Type 1 Diabetes",
    "Lung Cancer", "Breast Cancer",
    "Hypertension", "Heart Failure",
    "Parkinson", "Alzheimer",
    "Non-Small Cell Lung Cancer", "Chronic Kidney Disease",
]

KNOWN_EXCLUSION_MEDICATIONS = [
    "insulin", "chemotherapy", "Osimertinib",
]

KNOWN_EXCLUSION_SURGERIES = [
    "cardiac surgery", "bypass", "pneumonectomy", "valve replacement",
]


def fallback_parser(criteria_text: str) -> dict:
    """
    Regex-based fallback parser for when Gemini is unavailable.

    Args:
        criteria_text: Raw eligibility text.

    Returns:
        Best-effort structured dict with inclusion/exclusion keys.
    """
    text = criteria_text
    tl = text.lower()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

    inclusion = {}
    exclusion = {}

    # ── Age range ─────────────────────────────────────────────────────────────
    age_m = re.search(r"aged?\s+(?:between\s+)?(\d+)\s*(?:to|-)\s*(\d+)", tl)
    if age_m:
        inclusion["age"] = {"min": int(age_m.group(1)), "max": int(age_m.group(2))}

    # ── HbA1c range ───────────────────────────────────────────────────────────
    hba1c_m = re.search(
        r"hba1c\s+(?:levels?\s+)?(?:between\s+)?(\d+\.?\d*)\s*(?:to|-|and)\s*(\d+\.?\d*)",
        tl,
    )
    if hba1c_m:
        inclusion["HbA1c"] = {
            "min": float(hba1c_m.group(1)),
            "max": float(hba1c_m.group(2)),
        }

    # ── eGFR minimum ──────────────────────────────────────────────────────────
    egfr_m = re.search(
        r"egfr\s+(?:must\s+be\s+)?(?:greater than|>|above)\s+(\d+)",
        tl,
    )
    if egfr_m:
        inclusion["eGFR"] = {"min": int(egfr_m.group(1))}

    # ── BMI range ─────────────────────────────────────────────────────────────
    bmi_m = re.search(r"bmi\s+(?:between\s+)?(\d+\.?\d*)\s*(?:to|-|and)\s*(\d+\.?\d*)", tl)
    if bmi_m:
        inclusion["bmi"] = {"min": float(bmi_m.group(1)), "max": float(bmi_m.group(2))}

    bmi_under_m = re.search(r"bmi\s+(?:under|below|<)\s+(\d+\.?\d*)", tl)
    if bmi_under_m and "bmi" not in inclusion:
        inclusion["bmi"] = {"max": float(bmi_under_m.group(1))}

    # ── Diagnosis duration ────────────────────────────────────────────────────
    dur_m = re.search(r"(?:for\s+at\s+least|minimum\s+of)\s+(\d+)\s+years?", tl)
    if dur_m:
        inclusion["diagnosisDurationYears"] = {"min": int(dur_m.group(1))}

    # ── Location ──────────────────────────────────────────────────────────────
    loc_m = re.search(r"(?:located?\s+in|trial\s+in)\s+([A-Z][a-zA-Z]+(?:\s+or\s+[A-Z][a-zA-Z]+)*)", text)
    if loc_m:
        inclusion["location"] = loc_m.group(1).strip()

    # ── Smoking status ────────────────────────────────────────────────────────
    if any(kw in tl for kw in ["non-smoker", "never smoked", "non smoker", "no smoking"]):
        inclusion["smokingStatus"] = "Never"

    # ── Known diagnosis ───────────────────────────────────────────────────────
    for cond in KNOWN_CONDITIONS:
        if cond.lower() in tl:
            inclusion["diagnosis"] = cond
            break

    # ── Exclusion: medications ────────────────────────────────────────────────
    excluded_meds = []
    for med in KNOWN_EXCLUSION_MEDICATIONS:
        patterns = [
            rf"no\s+(?:prior\s+)?{med}", rf"not\s+on\s+{med}",
            rf"currently\s+not\s+on\s+{med}", rf"must\s+not\s+(?:have\s+)?(?:received\s+)?{med}",
            rf"not\s+receiving\s+{med}",
        ]
        if any(re.search(p, tl) for p in patterns):
            excluded_meds.append(med)
    if excluded_meds:
        exclusion["medications_excluded"] = excluded_meds

    # ── Exclusion: surgical history ───────────────────────────────────────────
    excluded_surgery = []
    for surg in KNOWN_EXCLUSION_SURGERIES:
        if re.search(rf"no\s+(?:prior\s+|recent\s+)?{surg}", tl):
            excluded_surgery.append(surg)
    if excluded_surgery:
        exclusion["surgicalHistory_excluded"] = excluded_surgery

    # ── Exclusion: general conditions ─────────────────────────────────────────
    generic_excl = re.findall(r"no\s+(?:active\s+)?([a-z\s]+?)(?:\.|,|$)", tl)
    excluded_conds = [
        c.strip() for c in generic_excl
        if c.strip() and c.strip() not in ["prior", "recent"] and len(c.strip()) > 4
    ]
    if excluded_conds:
        # Deduplicate with already-found surgical/meds
        existing_excl = set(
            v for vals in (
                exclusion.get("medications_excluded", []),
                exclusion.get("surgicalHistory_excluded", []),
            ) for v in vals
        )
        conds_clean = [c for c in excluded_conds if c not in existing_excl]
        if conds_clean:
            exclusion["conditions_excluded"] = conds_clean

    return {
        "parsedBy":          "regex-fallback",
        "parsingConfidence": 0.65,
        "rawInput":          criteria_text,
        "parsedAt":          timestamp,
        "inclusion":         inclusion,
        "exclusion":         exclusion,
    }


# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION 3: validate_parsed_criteria
# ─────────────────────────────────────────────────────────────────────────────

def validate_parsed_criteria(parsed: dict) -> dict:
    """
    Validate the output from parse_criteria or fallback_parser.

    Checks:
      - inclusion / exclusion keys present
      - at least 2 inclusion criteria
      - age range validity (min < max)
      - numeric range values are actually numbers

    Returns:
        Validation result dict with valid flag, warnings, and criteriaCoverage.
    """
    warnings = []

    inclusion = parsed.get("inclusion", None)
    exclusion = parsed.get("exclusion", None)

    if inclusion is None:
        warnings.append("'inclusion' key is missing from parsed output")
        inclusion = {}

    if exclusion is None:
        warnings.append("'exclusion' key is missing from parsed output")

    # ── Minimum inclusion criteria ────────────────────────────────────────────
    if len(inclusion) < 2:
        warnings.append(
            f"Only {len(inclusion)} inclusion criterion found — need at least 2 for matching"
        )

    # ── Age range validity ────────────────────────────────────────────────────
    age = inclusion.get("age")
    if age and isinstance(age, dict):
        lo, hi = age.get("min"), age.get("max")
        if lo is not None and hi is not None:
            if not (isinstance(lo, (int, float)) and isinstance(hi, (int, float))):
                warnings.append("Age min/max are not numeric")
            elif lo >= hi:
                warnings.append(f"Age range invalid: min ({lo}) >= max ({hi})")

    # ── Recommended fields ────────────────────────────────────────────────────
    recommended = ["diagnosis", "age", "HbA1c", "eGFR", "smokingStatus"]
    missing = [f for f in recommended if f not in inclusion]
    for m in missing:
        warnings.append(f"Recommended field '{m}' not found in inclusion criteria")

    # ── Numeric type check on all range dicts ─────────────────────────────────
    for key, val in inclusion.items():
        if isinstance(val, dict):
            for bound_key, bound_val in val.items():
                if bound_key in ("min", "max") and not isinstance(bound_val, (int, float)):
                    warnings.append(f"'{key}.{bound_key}' should be numeric, got {type(bound_val).__name__}")

    # ── Determine coverage ────────────────────────────────────────────────────
    n_criteria = len(inclusion)
    if n_criteria >= 5:
        coverage = "high"
    elif n_criteria >= 3:
        coverage = "medium"
    else:
        coverage = "low"

    valid = (
        len(inclusion) >= 2
        and not any("invalid" in w or "missing" in w.lower() and "Recommended" not in w for w in warnings)
    )

    return {
        "valid":             valid,
        "warnings":          warnings,
        "criteriaCoverage":  coverage,
        "parsed":            parsed,
    }
