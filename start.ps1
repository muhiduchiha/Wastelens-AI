Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Launching WASTELENS AI (Backend + Frontend)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Start Backend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\server'; Write-Host '🚀 Backend starting on port 3001...' -ForegroundColor Green; node --experimental-fetch src/index.js"

# Start Frontend Dev Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\client'; Write-Host '⚡ Frontend starting on port 5173...' -ForegroundColor Cyan; npx vite --port 5173"

# Wait and open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`n✅ Both servers are running!" -ForegroundColor Green
Write-Host "  • Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
