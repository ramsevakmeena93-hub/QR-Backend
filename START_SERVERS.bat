@echo off
title MITS Attendance System Launcher

echo ==========================================
echo    MITS Attendance System - Quick Start
echo ==========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Kill any existing processes on ports 3000 and 5000
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo ✓ Ports cleaned
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist package.json (
    echo ERROR: backend/package.json not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

npm install --silent
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    echo Trying to fix...
    npm cache clean --force
    npm install --silent
)

echo ✓ Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
if not exist package.json (
    echo ERROR: frontend/package.json not found!
    pause
    exit /b 1
)

npm install --silent
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    echo Trying to fix...
    npm cache clean --force
    npm install --silent
)

echo ✓ Frontend dependencies installed
echo.

REM Start backend server
echo Starting backend server...
cd ..\backend
start "MITS Backend Server" cmd /k "echo Backend Server Starting... && node server-simple.js"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
echo Starting frontend server...
cd ..\frontend
start "MITS Frontend Server" cmd /k "echo Frontend Server Starting... && npm start"

echo.
echo ==========================================
echo   Servers are starting...
echo ==========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo ==========================================
echo Teacher:  devanshu.tiwari@college.edu
echo Password: teacher123
echo.
echo Student:  ajay.meena@student.edu  
echo Password: student123
echo.
echo Admin:    admin@college.edu
echo Password: admin123
echo ==========================================
echo.
echo Wait 10-15 seconds for servers to fully start,
echo then the browser will open automatically...

timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo ✓ Application launched!
echo.
echo If you see any errors:
echo 1. Wait a bit longer for servers to start
echo 2. Refresh the browser page
echo 3. Check the server windows for error messages
echo.
pause