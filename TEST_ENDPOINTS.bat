@echo off
REM Clinerva Reverse Matching API — Quick Test Script
REM Run this from: c:\Users\sahil salap\Desktop\Clinerva
REM Admin: powershell executed with proper escaping

setlocal enabledelayedexpansion

:menu
cls
echo ====================================================================
echo   CLINERVA REVERSE MATCHING API — TEST SUITE
echo ====================================================================
echo.
echo Available tests:
echo   1) Parse criteria text (Gemini parser)
echo   2) Full reverse match (parse + rank + summarize)
echo   3) Preview quick stats (before full match)
echo   4) Retrieve search history (last 5 searches)
echo   5) Health check (server status)
echo.
echo   0) Exit
echo.
set /p choice="Enter choice [0-5]: "

if "%choice%"=="1" goto test_parse
if "%choice%"=="2" goto test_match
if "%choice%"=="3" goto test_preview
if "%choice%"=="4" goto test_history
if "%choice%"=="5" goto test_health
if "%choice%"=="0" goto end
echo Invalid choice. Press any key to try again.
pause > nul
goto menu

:test_parse
cls
echo Testing: POST /reverse/parse
echo ====================================================================
echo.
powershell -Command ^
  "$body = @{ criteriaText = 'Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery' } | ConvertTo-Json; " ^
  "try { " ^
  "  $response = Invoke-WebRequest -Uri 'http://localhost:8000/reverse/parse' -Method POST -ContentType 'application/json' -Body $body -ErrorAction Stop; " ^
  "  $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 " ^
  "} catch { " ^
  "  Write-Host 'ERROR: '$_.Exception.Message -ForegroundColor Red; " ^
  "  Write-Host 'Make sure server is running: uvicorn main:app --reload --port 8000' " ^
  "}"
echo.
pause
goto menu

:test_match
cls
echo Testing: POST /reverse/match
echo ====================================================================
echo.
powershell -Command ^
  "$body = @{ " ^
  "  criteriaText = 'Patients aged 40-65 with Type 2 Diabetes, HbA1c 7-10, non-smoker, eGFR above 45, no insulin, no cardiac surgery. Located in Mumbai.'; " ^
  "  filters = @{ " ^
  "    locationFilter = 'Mumbai'; " ^
  "    radiusKm = 500; " ^
  "    minScore = 60; " ^
  "    maxResults = 10 " ^
  "  } " ^
  "} | ConvertTo-Json; " ^
  "try { " ^
  "  $response = Invoke-WebRequest -Uri 'http://localhost:8000/reverse/match' -Method POST -ContentType 'application/json' -Body $body -ErrorAction Stop; " ^
  "  $json = $response.Content | ConvertFrom-Json; " ^
  "  Write-Host 'Total Candidates:' $json.summary.totalCandidates -ForegroundColor Green; " ^
  "  Write-Host 'Excellent Matches:' $json.summary.excellentMatches -ForegroundColor Green; " ^
  "  Write-Host 'Top Score:' $json.summary.topCandidate -ForegroundColor Green; " ^
  "  Write-Host 'Processing Time:' $json.processingTime -ForegroundColor Green; " ^
  "  Write-Host ''; " ^
  "  Write-Host 'Full response:' -ForegroundColor Cyan; " ^
  "  $json | ConvertTo-Json -Depth 10 " ^
  "} catch { " ^
  "  Write-Host 'ERROR: '$_.Exception.Message -ForegroundColor Red " ^
  "}"
echo.
pause
goto menu

:test_preview
cls
echo Testing: POST /reverse/parse-and-preview
echo ====================================================================
echo.
powershell -Command ^
  "$body = @{ criteriaText = 'Diabetic patients aged 40-65' } | ConvertTo-Json; " ^
  "try { " ^
  "  $response = Invoke-WebRequest -Uri 'http://localhost:8000/reverse/parse-and-preview' -Method POST -ContentType 'application/json' -Body $body -ErrorAction Stop; " ^
  "  $json = $response.Content | ConvertFrom-Json; " ^
  "  Write-Host 'Potential Matches:' $json.quickStats.potentialMatches -ForegroundColor Green; " ^
  "  Write-Host 'Total Patients:' $json.quickStats.totalPatients -ForegroundColor Green; " ^
  "  Write-Host 'Match Rate:' $json.quickStats.matchRate -ForegroundColor Green; " ^
  "  Write-Host 'Top Location:' $json.quickStats.topLocation -ForegroundColor Green; " ^
  "  Write-Host ''; " ^
  "  Write-Host $json.message -ForegroundColor Yellow " ^
  "} catch { " ^
  "  Write-Host 'ERROR: '$_.Exception.Message -ForegroundColor Red " ^
  "}"
echo.
pause
goto menu

:test_history
cls
echo Testing: GET /reverse/history
echo ====================================================================
echo.
powershell -Command ^
  "try { " ^
  "  $response = Invoke-WebRequest -Uri 'http://localhost:8000/reverse/history' -Method GET -ErrorAction Stop; " ^
  "  $json = $response.Content | ConvertFrom-Json; " ^
  "  Write-Host 'Total searches in history:' $json.count -ForegroundColor Green; " ^
  "  if ($json.history.Count -gt 0) { " ^
  "    Write-Host ''; " ^
  "    Write-Host 'Recent searches:' -ForegroundColor Cyan; " ^
  "    $json.history | ForEach-Object { " ^
  "      Write-Host ('  ['$_.searchId'] - '$_.matchedCount' matches - Score: '$_.topScore) -ForegroundColor White; " ^
  "    } " ^
  "  } else { " ^
  "    Write-Host 'No searches yet. Run other tests first.' -ForegroundColor Yellow " ^
  "  } " ^
  "} catch { " ^
  "  Write-Host 'ERROR: '$_.Exception.Message -ForegroundColor Red " ^
  "}"
echo.
pause
goto menu

:test_health
cls
echo Testing: GET /health
echo ====================================================================
echo.
powershell -Command ^
  "try { " ^
  "  $response = Invoke-WebRequest -Uri 'http://localhost:8000/health' -Method GET -ErrorAction Stop; " ^
  "  $json = $response.Content | ConvertFrom-Json; " ^
  "  Write-Host 'Status: ' $json.status -ForegroundColor Green; " ^
  "  Write-Host 'Service: ' $json.service -ForegroundColor Green; " ^
  "  Write-Host ''; " ^
  "  Write-Host 'Server is RUNNING and responding!' -ForegroundColor Green " ^
  "} catch { " ^
  "  Write-Host 'Server is NOT RESPONDING' -ForegroundColor Red; " ^
  "  Write-Host 'Start the server with:' -ForegroundColor Yellow; " ^
  "  Write-Host '  cd c:\Users\sahil salap\Desktop\Clinerva'; " ^
  "  Write-Host '  uvicorn main:app --reload --port 8000' " ^
  "}"
echo.
pause
goto menu

:end
echo.
echo Goodbye!
endlocal
