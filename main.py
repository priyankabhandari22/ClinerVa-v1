"""
main.py — Clinerva AI Engine FastAPI Server
Connects: data_layer, dummy_data, rule_engine, ml_scorer, explainer,
          gemini_parser, reverse_rule_engine
Run: uvicorn main:app --reload --port 8000
"""

import os
import uuid
import traceback
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load .env (if present) for GEMINI_API_KEY
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Local module imports ─────────────────────────────────────────────────────
from data_layer import anonymize_patient
from dummy_data import CLINICAL_TRIALS, RAW_PATIENTS
from rule_engine import check_eligibility
from ml_scorer import calculate_score
from explainer import explain
from gemini_parser import (
    parse_criteria,
    fallback_parser,
    validate_parsed_criteria,
)
from reverse_rule_engine import (
    match_patients_to_criteria,
    get_recruitment_summary,
)

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Clinerva AI Engine",
    description="Clinical trial matching API — anonymize, evaluate, score, explain.",
    version="1.0.0",
)

# Allow all origins (dev mode — restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ────────────────────────────────────────────────

class PatientInput(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    age: int
    gender: Optional[str] = ""
    diagnosis: str
    medications: List[str] = []
    labResults: Dict[str, Any] = {}
    smokingStatus: Optional[str] = ""
    surgicalHistory: Optional[str] = "None"
    location: str


class MatchRequest(BaseModel):
    patient: PatientInput


class AnonymizeRequest(BaseModel):
    patient: Dict[str, Any]


# ── Reverse-match request models ─────────────────────────────────────────────

class ParseRequest(BaseModel):
    criteriaText: str


class ReverseFilters(BaseModel):
    locationFilter: Optional[str] = None
    radiusKm:       Optional[int] = None
    minScore:       float          = 0
    maxResults:     int            = 20


class ReverseMatchRequest(BaseModel):
    criteriaText: str
    filters:      Optional[ReverseFilters] = None


# ── In-memory search history (max 5) ─────────────────────────────────────────
reverse_match_history: List[Dict[str, Any]] = []


# ── Endpoint 4: GET /health ──────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health_check():
    """Quick liveness check."""
    return {"status": "ok", "service": "Clinerva AI Engine"}


# ── Endpoint 2: GET /trials ──────────────────────────────────────────────────

@app.get("/trials", tags=["Data"])
def get_trials():
    """Return the full list of available clinical trials with criteria."""
    return {"trials": CLINICAL_TRIALS, "total": len(CLINICAL_TRIALS)}


# ── Endpoint 3: POST /anonymize ──────────────────────────────────────────────

@app.post("/anonymize", tags=["Data"])
def anonymize(request: AnonymizeRequest):
    """Anonymize a raw patient record — strips PII and generates a CLN- ID."""
    try:
        result = anonymize_patient(request.patient)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Anonymization failed: {str(e)}")


# ── Endpoint 1: POST /match ──────────────────────────────────────────────────

@app.post("/match", tags=["Matching"])
def match_patient(request: MatchRequest):
    """
    Full matching pipeline for one patient against all clinical trials.

    Pipeline:
      1. anonymize_patient()
      2. For each trial → check_eligibility()
      3.   If eligible → calculate_score() + explain()
      4. Sort by confidenceScore descending
      5. Return ranked results
    """
    try:
        raw_patient = request.patient.model_dump()

        # ── Step 1: Anonymize ────────────────────────────────────────────────
        anon_patient = anonymize_patient(raw_patient)
        patient_id   = anon_patient["patientId"]
        patient_loc  = raw_patient.get("location", "")

        ranked_results = []
        total_evaluated = 0
        eligible_count  = 0

        # ── Step 2: Evaluate each trial ──────────────────────────────────────
        for trial in CLINICAL_TRIALS:
            total_evaluated += 1
            trial_criteria = trial.get("criteria", {})
            trial_loc      = trial.get("location", "")

            try:
                # a. Rule check
                rule_result = check_eligibility(anon_patient, trial_criteria)

                if rule_result.get("eligible"):
                    eligible_count += 1

                    # b. Score
                    score_result = calculate_score(anon_patient, trial, rule_result)

                    # c. Explain
                    explanation = explain(anon_patient, trial, score_result)

                    ranked_results.append({
                        "trialId":         trial.get("trialId"),
                        "trialName":       trial.get("name"),
                        "confidenceScore": score_result.get("finalScore", 0),
                        "category":        score_result.get("category"),
                        "color":           score_result.get("color"),
                        "phase":           trial.get("phase"),
                        "location":        trial_loc,
                        "status":          trial.get("status"),
                        "sponsor":         trial.get("sponsor"),
                        "scoreBreakdown":  score_result.get("featureVector", {}),
                        "ruleResult":      rule_result,
                        "explanation":     explanation,
                    })

            except Exception as trial_err:
                # Don't let one trial failure kill the whole request
                ranked_results.append({
                    "trialId": trial.get("trialId"),
                    "error":   str(trial_err),
                    "eligible": False,
                })

        # ── Step 3: Sort by confidenceScore descending ───────────────────────
        ranked_results.sort(
            key=lambda r: r.get("confidenceScore", -1),
            reverse=True,
        )

        # ── Step 4: Add rank numbers ─────────────────────────────────────────
        for i, result in enumerate(ranked_results, 1):
            result["rank"] = i

        return {
            "patientId":      patient_id,
            "totalEvaluated": total_evaluated,
            "eligibleCount":  eligible_count,
            "rankedResults":  ranked_results,
        }

    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail={"error": str(e), "trace": tb},
        )


# ═════════════════════════════════════════════════════════════════════════════
# REVERSE MATCH ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

# ── POST /reverse/parse ───────────────────────────────────────────────────────

@app.post("/reverse/parse", tags=["Reverse Matching"])
def reverse_parse(request: ParseRequest):
    """
    Parse raw eligibility text via Gemini and return structured JSON.
    Falls back to regex parser if Gemini is unavailable — never crashes.
    """
    try:
      
        parsed   = parse_criteria(request.criteriaText)
        validated = validate_parsed_criteria(parsed)
        return {
            "success":           True,
            "parsedBy":          parsed.get("parsedBy"),
            "parsingConfidence": parsed.get("parsingConfidence"),
            "criteriaCoverage":  validated.get("criteriaCoverage"),
            "warnings":          validated.get("warnings", []),
            "structured": {
                "inclusion": parsed.get("inclusion", {}),
                "exclusion": parsed.get("exclusion", {}),
            },
        }
    except Exception as e:
        # Last-resort: regex fallback
        try:
            parsed = fallback_parser(request.criteriaText)
            return {
                "success":           True,
                "parsedBy":          "regex-fallback (emergency)",
                "parsingConfidence": 0.50,
                "criteriaCoverage":  "low",
                "warnings":          [f"Gemini unavailable: {str(e)}"],
                "structured": {
                    "inclusion": parsed.get("inclusion", {}),
                    "exclusion": parsed.get("exclusion", {}),
                },
            }
        except Exception as fe:
            raise HTTPException(status_code=500, detail=str(fe))


# ── POST /reverse/match ───────────────────────────────────────────────────────

@app.post("/reverse/match", tags=["Reverse Matching"])
def reverse_match(request: ReverseMatchRequest):
    """
    Full reverse pipeline: parse criteria → score all patients → rank results.
    """
    try:
        filters = request.filters or ReverseFilters()

        # 1. Parse criteria
        try:
            parsed = parse_criteria(request.criteriaText)
        except Exception:
            parsed = fallback_parser(request.criteriaText)

        # 2. Validate
        validated = validate_parsed_criteria(parsed)

        # 3. Run reverse matcher
        result = match_patients_to_criteria(
            parsed_criteria  = parsed,
            patients_list    = RAW_PATIENTS,
            location_filter  = filters.locationFilter,
            min_score        = filters.minScore,
        )

        # 4. Apply maxResults cap
        ranked = result["rankedPatients"][: filters.maxResults]

        # 5. Recruitment summary (on capped list)
        result_for_summary = dict(result)
        result_for_summary["rankedPatients"] = ranked
        summary = get_recruitment_summary(result_for_summary)

        # 6. Store in history (max 5)
        history_entry = {
            "searchId":       f"REV-{str(uuid.uuid4())[:6].upper()}",
            "criteriaPreview": request.criteriaText[:120],
            "matchedCount":   len(ranked),
            "topScore":       ranked[0]["finalScore"] if ranked else 0,
            "searchedAt":     datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
        }
        reverse_match_history.append(history_entry)
        if len(reverse_match_history) > 5:
            reverse_match_history.pop(0)

        return {
            "success":          True,
            "criteriaText":     request.criteriaText,
            "parsedCriteria":   parsed,
            "parsingConfidence": parsed.get("parsingConfidence"),
            "filters": {
                "locationFilter": filters.locationFilter,
                "radiusKm":       filters.radiusKm,
                "minScore":       filters.minScore,
                "maxResults":     filters.maxResults,
            },
            "summary":           summary,
            "rankedPatients":    ranked,
            "disqualifiedCount": len(result["disqualifiedPatients"]),
            "processingTime":    result["processingTime"],
        }

    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail={"error": str(e), "trace": tb},
        )


# ── POST /reverse/parse-and-preview ──────────────────────────────────────────

@app.post("/reverse/parse-and-preview", tags=["Reverse Matching"])
def reverse_preview(request: ParseRequest):
    """
    Lightweight preview — parse criteria and run rule-engine only (no ML/SHAP).
    Returns quick stats so the UI can show a count before the full match run.
    """
    try:
        try:
            parsed = parse_criteria(request.criteriaText)
        except Exception:
            parsed = fallback_parser(request.criteriaText)

        total     = len(RAW_PATIENTS)
        potential = 0
        locations: Dict[str, int] = {}

        for raw in RAW_PATIENTS:
            try:
                anon   = anonymize_patient(raw)
                anon["location"] = raw.get("location", "")
                result = check_eligibility(anon, parsed)
                if result.get("eligible"):
                    potential += 1
                    city = raw.get("location", "Unknown").split(",")[0].strip()
                    locations[city] = locations.get(city, 0) + 1
            except Exception:
                continue

        top_location = max(locations, key=locations.get) if locations else "N/A"
        match_rate   = f"{round(potential / total * 100)}%" if total else "0%"
        est_time     = f"~{round(potential * 0.3 + 0.5, 1)} seconds"

        return {
            "parsedCriteria": {
                "inclusion": parsed.get("inclusion", {}),
                "exclusion": parsed.get("exclusion", {}),
            },
            "quickStats": {
                "potentialMatches":       potential,
                "totalPatients":          total,
                "matchRate":              match_rate,
                "topLocation":            top_location,
                "estimatedProcessingTime": est_time,
            },
            "message": (
                f"Found {potential} potential match(es) out of {total} patients. "
                "Run full match for detailed scores and explanations."
            ),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /reverse/history ──────────────────────────────────────────────────────

@app.get("/reverse/history", tags=["Reverse Matching"])
def reverse_history():
    """Return the last 5 reverse match searches (in-memory, cleared on restart)."""
    return {
        "history": list(reversed(reverse_match_history)),  # newest first
        "count":   len(reverse_match_history),
    }


# ── Dev runner ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
