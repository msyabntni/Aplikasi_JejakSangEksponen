@echo off
rem Mode pengembangan (perubahan kode langsung terlihat) dengan Node.js portable.
setlocal
set "NODE_DIR=%LOCALAPPDATA%\node-portable\node-v26.13.1-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"
where node >nul 2>nul || (echo Node.js tidak ditemukan. & pause & exit /b 1)
cd /d "%~dp0"
set NEXT_TELEMETRY_DISABLED=1
if not exist node_modules call npm install
call npm run dev
