Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting PredictAI - Smart Predictive Maintenance System" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host "Launching Backend (FastAPI on port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

Write-Host "Launching Frontend (Vite on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 3
Write-Host "Opening web browser at http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"

Write-Host "`nPredictAI is running!" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:5173"
Write-Host "Backend:  http://127.0.0.1:8000"
Write-Host "API Docs: http://127.0.0.1:8000/docs"
