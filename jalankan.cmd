@echo off
rem Menjalankan JEJAK SANG EKSPONEN (mode produksi) dengan Node.js portable.
rem Klik dua kali file ini, lalu buka http://localhost:3000 di browser.
setlocal
set "NODE_DIR=%LOCALAPPDATA%\node-portable\node-v26.13.1-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"
where node >nul 2>nul || (echo Node.js tidak ditemukan. Lihat README bagian "Menjalankan secara lokal". & pause & exit /b 1)
cd /d "%~dp0"
set NEXT_TELEMETRY_DISABLED=1
if not exist node_modules (echo Menginstal dependency... & call npm install || (pause & exit /b 1))
if not exist .next\BUILD_ID (echo Membangun aplikasi... & call npm run build || (pause & exit /b 1))
echo.
echo   JEJAK SANG EKSPONEN berjalan di http://localhost:3000
echo   Tekan Ctrl+C untuk berhenti.
rem Backend Python (folder api/) dijalankan di jendela terpisah, port 5328.
where python >nul 2>nul && (start "Backend Python Jejak Sang Eksponen" /min python backend\dev_server.py) || echo   [info] Python tidak ditemukan: penilaian memakai cadangan di browser.
echo.
start "" http://localhost:3000
call npm start
