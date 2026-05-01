# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
Set-Location -Path "backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
