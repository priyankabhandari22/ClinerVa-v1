# Clinerva Reverse Matching API — Complete Documentation

## 🚀 Overview

The FastAPI server includes **4 new reverse-matching endpoints** that enable patient recruitment by parsing trial criteria and finding matching patients.

**Features:**
- ✅ CORS enabled (development mode)
- ✅ .env support for GEMINI_API_KEY
- ✅ Gemini 2.0 Flash with fallback regex parser
- ✅ In-memory search history (max 5 searches)
- ✅ No dependencies on external databases — uses dummy_data.py

---

## 📋 Running the Server

```bash
cd c:\Users\sahil salap\Desktop\Clinerva
uvicorn main:app --reload --port 8000
```

Check health:
```bash
curl http://localhost:8000/health
```

---

## 📡 Endpoint 1: POST `/reverse/parse`

**Purpose:** Parse raw criteria text using Gemini and return structured JSON (preview before matching)

**Request Body:**
```json
{
  "criteriaText": "Patients must be aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery"
}
```

**Response (Success):**
```json
{
  "success": true,
  "parsedBy": "gemini-2.0-flash-exp",
  "parsingConfidence": 0.95,
  "criteriaCoverage": "high",
  "warnings": [],
  "structured": {
    "inclusion": {
      "age": { "min": 40, "max": 65 },
      "diagnosis": "Type 2 Diabetes",
      "HbA1c": { "min": 7.0, "max": 10.0 },
      "smokingStatus": "Never",
      "eGFR": { "min": 45 }
    },
    "exclusion": {
      "medications_excluded": ["insulin"],
      "surgicalHistory_excluded": ["cardiac surgery"]
    }
  }
}
```

**Error Handling:** If Gemini API fails → automatically uses fallback regex parser

---

### CURL Test:

```bash
curl -X POST http://localhost:8000/reverse/parse \
  -H "Content-Type: application/json" \
  -d '{
    "criteriaText": "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery"
  }'
```

---

## 📡 Endpoint 2: POST `/reverse/match`

**Purpose:** Full reverse pipeline — parse criteria text and return ranked matching patients

**Request Body:**
```json
{
  "criteriaText": "Patients must be aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR > 45, no prior cardiac surgery, not on insulin. Located in Mumbai.",
  "filters": {
    "locationFilter": "Mumbai",
    "radiusKm": 500,
    "minScore": 60,
    "maxResults": 10
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "criteriaText": "Patients must be aged 40-65...",
  "parsedCriteria": {
    "inclusion": { "age": { "min": 40, "max": 65 }, ... },
    "exclusion": { "medications_excluded": ["insulin"], ... }
  },
  "parsingConfidence": 0.95,
  "filters": {
    "locationFilter": "Mumbai",
    "radiusKm": 500,
    "minScore": 60,
    "maxResults": 10
  },
  "summary": {
    "totalCandidates": 4,
    "excellentMatches": 1,
    "goodMatches": 2,
    "averageScore": 78.5,
    "topCandidate": "CLN-A3F8B21C",
    "insight": "2 strong candidates in Mumbai, both with excellent HbA1c control"
  },
  "rankedPatients": [
    {
      "rank": 1,
      "patientId": "CLN-A3F8B21C",
      "age": 52,
      "diagnosis": "Type 2 Diabetes",
      "location": "Mumbai",
      "distanceKm": 0,
      "confidenceScore": 92.3,
      "category": "Excellent Match",
      "color": "green",
      "criteriaResults": [
        { "criterion": "age", "status": "pass", "value": "52" },
        { "criterion": "HbA1c", "status": "pass", "value": "7.8" }
      ],
      "explanation": {
        "doctorView": "Patient meets all clinical requirements...",
        "recruitmentNote": "Strong candidate with excellent medication compliance"
      }
    },
    {
      "rank": 2,
      "patientId": "CLN-B7K2L9M1",
      "age": 48,
      "diagnosis": "Type 2 Diabetes",
      "location": "Mumbai",
      "distanceKm": 5,
      "confidenceScore": 85.7,
      "category": "Good Match",
      "color": "lightgreen",
      "criteriaResults": [...],
      "explanation": {...}
    }
  ],
  "disqualifiedCount": 6,
  "processingTime": "1.4s"
}
```

**Pipeline Steps:**
1. Parse criteria (Gemini → fallback)
2. Load all patients from dummy_data.py
3. Match patients against parsed criteria
4. Apply location/minScore filters
5. Cap results at maxResults
6. Generate recruitment summary
7. Store in history

---

### CURL Test:

```bash
curl -X POST http://localhost:8000/reverse/match \
  -H "Content-Type: application/json" \
  -d '{
    "criteriaText": "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery. Located in Mumbai.",
    "filters": {
      "locationFilter": "Mumbai",
      "radiusKm": 500,
      "minScore": 60,
      "maxResults": 10
    }
  }'
```

---

## 📡 Endpoint 3: POST `/reverse/parse-and-preview`

**Purpose:** Lightweight endpoint — just parse and show how many patients MIGHT match before full run

**Request Body:**
```json
{
  "criteriaText": "Diabetic patients aged 40-65"
}
```

**Response:**
```json
{
  "parsedCriteria": {
    "inclusion": { "age": { "min": 40, "max": 65 }, "diagnosis": "Diabetes" },
    "exclusion": {}
  },
  "quickStats": {
    "potentialMatches": 4,
    "totalPatients": 10,
    "matchRate": "40%",
    "topLocation": "Mumbai",
    "estimatedProcessingTime": "~1.7 seconds"
  },
  "message": "Found 4 potential match(es) out of 10 patients. Run full match for detailed scores and explanations."
}
```

**Use Case:** UI shows this before user clicks "Full Match" button

---

### CURL Test:

```bash
curl -X POST http://localhost:8000/reverse/parse-and-preview \
  -H "Content-Type: application/json" \
  -d '{ "criteriaText": "Diabetic patients aged 40-65" }'
```

---

## 📡 Endpoint 4: GET `/reverse/history`

**Purpose:** Return last 5 reverse match searches (in-memory, cleared on restart)

**Response:**
```json
{
  "history": [
    {
      "searchId": "REV-A1B2C3",
      "criteriaPreview": "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10...",
      "matchedCount": 4,
      "topScore": 92.3,
      "searchedAt": "2026-03-07T14:32:15"
    },
    {
      "searchId": "REV-X9Y8Z7",
      "criteriaPreview": "Hypertension patients aged 50-70, on ACE inhibitor...",
      "matchedCount": 2,
      "topScore": 78.5,
      "searchedAt": "2026-03-07T14:15:42"
    }
  ],
  "count": 2
}
```

---

### CURL Test:

```bash
curl http://localhost:8000/reverse/history
```

---

## 🔍 Complete CURL Test Suite

### Test 1: Parse Only (No Matching)
```bash
curl -X POST http://localhost:8000/reverse/parse \
  -H "Content-Type: application/json" \
  -d '{
    "criteriaText": "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery"
  }'
```

### Test 2: Full Reverse Match
```bash
curl -X POST http://localhost:8000/reverse/match \
  -H "Content-Type: application/json" \
  -d '{
    "criteriaText": "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery. Located in Mumbai.",
    "filters": {
      "locationFilter": "Mumbai",
      "radiusKm": 500,
      "minScore": 60,
      "maxResults": 10
    }
  }'
```

### Test 3: Quick Preview
```bash
curl -X POST http://localhost:8000/reverse/parse-and-preview \
  -H "Content-Type: application/json" \
  -d '{ "criteriaText": "Diabetic patients aged 40-65" }'
```

### Test 4: Search History
```bash
curl http://localhost:8000/reverse/history
```

### Test 5: Health Check
```bash
curl http://localhost:8000/health
```

---

## 🛠 PowerShell Test (Windows)

```powershell
# Test 1: Parse
$body = @{
    criteriaText = "Patients aged 40-65 with Type 2 Diabetes"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/reverse/parse" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5


# Test 2: Full Match
$body = @{
    criteriaText = "Patients aged 40-65 with Type 2 Diabetes located in Mumbai"
    filters = @{
        locationFilter = "Mumbai"
        radiusKm = 500
        minScore = 60
        maxResults = 10
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/reverse/match" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10


# Test 3: History
Invoke-WebRequest -Uri "http://localhost:8000/reverse/history" `
  -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 💾 Configuration

**Environment Variables (.env):**
```
GEMINI_API_KEY=your_key_here
```

If .env is missing or GEMINI_API_KEY is not set:
- Parse requests still work ✅ (uses fallback regex parser)
- Parsing confidence will be lower (0.50 vs 0.95)
- All endpoints remain functional

---

## 🔗 Dependencies

All modules already exist in the project:

| Module | Functions Used |
|--------|-----------------|
| **gemini_parser.py** | `parse_criteria()`, `fallback_parser()`, `validate_parsed_criteria()` |
| **reverse_rule_engine.py** | `match_patients_to_criteria()`, `get_recruitment_summary()` |
| **rule_engine.py** | `check_eligibility()` |
| **data_layer.py** | `anonymize_patient()` |
| **dummy_data.py** | `RAW_PATIENTS`, `CLINICAL_TRIALS` |

---

## ✅ Features Implemented

- ✅ **CORS** enabled for cross-origin requests (localhost:3173, localhost:5173, etc.)
- ✅ **.env** support for GEMINI_API_KEY
- ✅ **Gemini 2.0 Flash** parser with automatic fallback
- ✅ **Error handling** — never crashes, always returns something
- ✅ **In-memory history** — max 5 searches, auto-pops oldest
- ✅ **Structured responses** — consistent JSON format across all endpoints
- ✅ **Location filtering** — optional radius-based search
- ✅ **Score filtering** — configurable minScore threshold
- ✅ **Result limiting** — maxResults pagination support
- ✅ **Recruitment summary** — AI-generated insights on match candidates
- ✅ **Processing time** — included in responses for performance monitoring

---

## 🧪 Expected Behavior

| Scenario | Expected Output |
|----------|-----------------|
| Parse with Gemini success | ✅ High confidence (0.95), structured criteria |
| Parse with Gemini failure | ✅ Fallback regex, lower confidence (0.50) |
| Full match with 5 patients | ✅ Ranked list with scores 80-95 |
| Full match with no matches | ✅ Empty list, 0 in summary |
| History with < 5 searches | ✅ Return all searches (newest first) |
| History with > 5 searches | ✅ Return only last 5 (oldest auto-removed) |
| Server restart | ✅ History cleared (in-memory) |

---

## 📞 Support

**Issues?**
1. Check that all module imports are present in `main.py` ✅
2. Verify GEMINI_API_KEY is in `.env` or environment variables
3. Ensure `gemini_parser.py` and `reverse_rule_engine.py` are in root directory
4. Restart server: `uvicorn main:app --reload --port 8000`

---

**Status:** ✅ **All reverse endpoints fully implemented and ready for testing**
