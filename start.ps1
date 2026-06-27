# Social Analytics Dashboard - Запуск
Write-Host "Starting Social Analytics Dashboard..." -ForegroundColor Cyan

# Start backend
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; npm run dev' -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 2

# Start frontend
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev' -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Start-Process "http://localhost:3000"
