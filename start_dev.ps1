# WebInsight Development Starter
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting WebInsight - AI Website Summarizer" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Launching Backend on http://127.0.0.1:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; python app.py"

Write-Host "Launching Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "`nBoth services launched!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://127.0.0.1:5000" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
