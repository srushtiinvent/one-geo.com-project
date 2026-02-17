@echo off
REM Well-Log Analysis System - Installation & Run Script for Windows
REM This script automates setup and running locally

echo.
echo ============================================================
echo.
echo   Well-Log Data Analysis System
echo      Setup Script for Windows
echo.
echo ============================================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install from nodejs.org
    pause
    exit /b 1
)
FOR /F "tokens=*" %%i IN ('node -v') DO SET NODE_VERSION=%%i
echo OK: Node.js %NODE_VERSION% found

REM Check npm
echo [2/5] Checking npm...
WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)
FOR /F "tokens=*" %%i IN ('npm -v') DO SET NPM_VERSION=%%i
echo OK: npm %NPM_VERSION% found

REM Create directories
echo [3/5] Creating directories...
IF NOT EXIST data mkdir data
IF NOT EXIST uploads mkdir uploads
echo OK: Created data\ and uploads\ directories

REM Setup Backend
echo [4/5] Setting up backend...
cd backend
IF NOT EXIST node_modules (
    echo Installing backend dependencies...
    call npm install
)
IF NOT EXIST .env (
    copy .env.example .env
    echo OK: Created .env file
)
cd ..
echo OK: Backend ready

REM Setup Frontend
echo [5/5] Setting up frontend...
cd frontend
IF NOT EXIST node_modules (
    echo Installing frontend dependencies...
    call npm install
)
cd ..
echo OK: Frontend ready

REM Success!
echo.
echo ============================================================
echo.
echo   Setup Complete!
echo.
echo ============================================================
echo.
echo To start the application, run:
echo.
echo Terminal 1 - Backend:
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo For detailed instructions, see QUICKSTART.md
echo.
pause
