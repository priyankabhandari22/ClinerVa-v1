# Clinerva Reverse Matching API — PowerShell Test Suite
# Usage: powershell -ExecutionPolicy Bypass -File TEST_ENDPOINTS.ps1

param(
    [ValidateSet("parse", "match", "preview", "history", "health", "all")]
    [string]$Test = "menu"
)

$BaseUrl = "http://localhost:8000"
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Info    = "Cyan"
    Warning = "Yellow"
}

function Show-Menu {
    Clear-Host
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  CLINERVA REVERSE MATCHING API — TEST SUITE" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Parse criteria text (Gemini parser)"
    Write-Host "  [2] Full reverse match (parse + rank + summarize)"
    Write-Host "  [3] Preview quick stats (before full match)"
    Write-Host "  [4] Retrieve search history (last 5 searches)"
    Write-Host "  [5] Health check (server status)"
    Write-Host "  [6] Run all tests sequentially"
    Write-Host ""
    Write-Host "  [0] Exit"
    Write-Host ""
    $choice = Read-Host "Enter choice [0-6]"
    switch ($choice) {
        "1" { Test-ParseEndpoint }
        "2" { Test-MatchEndpoint }
        "3" { Test-PreviewEndpoint }
        "4" { Test-HistoryEndpoint }
        "5" { Test-HealthEndpoint }
        "6" { Run-AllTests }
        "0" { exit }
        default { Show-Menu }
    }
}

function Test-HealthEndpoint {
    Clear-Host
    Write-Host "Testing: GET /health" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ Server is RUNNING" -ForegroundColor Green
        Write-Host "  Status: $($data.status)" -ForegroundColor Green
        Write-Host "  Service: $($data.service)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Server is NOT responding" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Start server with:" -ForegroundColor Yellow
        Write-Host "    cd 'c:\Users\sahil salap\Desktop\Clinerva'" -ForegroundColor Gray
        Write-Host "    uvicorn main:app --reload --port 8000" -ForegroundColor Gray
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

function Test-ParseEndpoint {
    Clear-Host
    Write-Host "Testing: POST /reverse/parse" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $body = @{
        criteriaText = "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/reverse/parse" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ Parse successful" -ForegroundColor Green
        Write-Host "  Parsed by: $($data.parsedBy)" -ForegroundColor Green
        Write-Host "  Confidence: $($data.parsingConfidence)" -ForegroundColor Green
        Write-Host "  Coverage: $($data.criteriaCoverage)" -ForegroundColor Green
        Write-Host "  Warnings: $($data.warnings.Count) warning(s)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Inclusion criteria:" -ForegroundColor Cyan
        $data.structured.inclusion | ConvertTo-Json | Write-Host
        Write-Host ""
        Write-Host "Exclusion criteria:" -ForegroundColor Cyan
        $data.structured.exclusion | ConvertTo-Json | Write-Host
    }
    catch {
        Write-Host "✗ Error during parsing" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

function Test-MatchEndpoint {
    Clear-Host
    Write-Host "Testing: POST /reverse/match" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Searching for Type 2 Diabetes patients in Mumbai..." -ForegroundColor Yellow
    Write-Host ""
    
    $body = @{
        criteriaText = "Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery. Located in Mumbai."
        filters = @{
            locationFilter = "Mumbai"
            radiusKm       = 500
            minScore       = 60
            maxResults     = 10
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/reverse/match" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✓ Match completed successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "Summary:" -ForegroundColor Cyan
            Write-Host "  Total Candidates: $($data.summary.totalCandidates)" -ForegroundColor Green
            Write-Host "  Excellent Matches: $($data.summary.excellentMatches)" -ForegroundColor Green
            Write-Host "  Good Matches: $($data.summary.goodMatches)" -ForegroundColor Green
            Write-Host "  Average Score: $($data.summary.averageScore)" -ForegroundColor Green
            Write-Host "  Top Candidate: $($data.summary.topCandidate)" -ForegroundColor Green
            Write-Host "  Processing Time: $($data.processingTime)" -ForegroundColor Green
            Write-Host ""
            Write-Host "Insight:" -ForegroundColor Cyan
            Write-Host "  $($data.summary.insight)" -ForegroundColor White
            Write-Host ""
            
            if ($data.rankedPatients.Count -gt 0) {
                Write-Host "Top 3 Matches:" -ForegroundColor Cyan
                $data.rankedPatients | Select-Object -First 3 | ForEach-Object {
                    Write-Host "  [$($_.rank)] $($_.patientId) - Score: $($_.confidenceScore)% - $($_.category)" -ForegroundColor $($_.color -eq 'green' ? 'Green' : 'Yellow')
                    Write-Host "    Location: $($_.location) | Age: $($_.age) | $($_.explanation.recruitmentNote)" -ForegroundColor Gray
                }
            }
        }
    }
    catch {
        Write-Host "✗ Error during matching" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

function Test-PreviewEndpoint {
    Clear-Host
    Write-Host "Testing: POST /reverse/parse-and-preview" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Quick preview (lightweight, no scoring)..." -ForegroundColor Yellow
    Write-Host ""
    
    $body = @{
        criteriaText = "Diabetic patients aged 40-65"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/reverse/parse-and-preview" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ Preview completed" -ForegroundColor Green
        Write-Host ""
        Write-Host "Quick Stats:" -ForegroundColor Cyan
        Write-Host "  Potential Matches: $($data.quickStats.potentialMatches)" -ForegroundColor Green
        Write-Host "  Total Patients: $($data.quickStats.totalPatients)" -ForegroundColor Green
        Write-Host "  Match Rate: $($data.quickStats.matchRate)" -ForegroundColor Green
        Write-Host "  Top Location: $($data.quickStats.topLocation)" -ForegroundColor Green
        Write-Host "  Est. Processing Time: $($data.quickStats.estimatedProcessingTime)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Message:" -ForegroundColor Cyan
        Write-Host "  $($data.message)" -ForegroundColor Yellow
    }
    catch {
        Write-Host "✗ Error during preview" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

function Test-HistoryEndpoint {
    Clear-Host
    Write-Host "Testing: GET /reverse/history" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/reverse/history" `
            -Method GET `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ History retrieved" -ForegroundColor Green
        Write-Host "  Total searches: $($data.count)" -ForegroundColor Green
        
        if ($data.history.Count -gt 0) {
            Write-Host ""
            Write-Host "Recent searches (newest first):" -ForegroundColor Cyan
            $data.history | ForEach-Object {
                Write-Host "  [$($_.searchId)] - Matches: $($_.matchedCount) | Top Score: $($_.topScore)" -ForegroundColor Green
                Write-Host "    Criteria: $($_.criteriaPreview)..." -ForegroundColor Gray
                Write-Host "    Searched: $($_.searchedAt)" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "  (No searches yet. Run other tests first.)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "✗ Error retrieving history" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

function Run-AllTests {
    Write-Host "Running all tests..." -ForegroundColor Yellow
    Write-Host ""
    
    Test-HealthEndpoint
    Test-ParseEndpoint
    Test-PreviewEndpoint
    Test-MatchEndpoint
    Test-HistoryEndpoint
    
    Write-Host "✓ All tests completed!" -ForegroundColor Green
    Read-Host "Press Enter to return to menu"
    Show-Menu
}

# Main entry point
if ($Test -eq "menu") {
    Show-Menu
}
else {
    switch ($Test) {
        "parse"   { Test-ParseEndpoint }
        "match"   { Test-MatchEndpoint }
        "preview" { Test-PreviewEndpoint }
        "history" { Test-HistoryEndpoint }
        "health"  { Test-HealthEndpoint }
        "all"     { Run-AllTests }
    }
}
