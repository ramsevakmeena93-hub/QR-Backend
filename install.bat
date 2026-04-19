@echo off
echo ========================================
echo QR Attendance System - Installation
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/5] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo [3/5] Creating environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please update with your settings.
) else (
    echo .env file already exists.
)
echo.

echo [4/5] Checking MongoDB...
echo Please ensure MongoDB is running on localhost:27017
echo Or update MONGODB_URI in .env file
echo.

echo [5/5] Installation complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Update .env file with your settings
echo 2. Start MongoDB if not running
echo 3. Run 'npm start' to start backend
echo 4. Run 'cd frontend && npm start' to start frontend
echo 5. Open http://localhost:3000 in browser
echo.
echo For detailed instructions, see README.md
echo ========================================
pause
