@echo off
echo ===============================================
echo TSOAM CHURCH MANAGEMENT SYSTEM
echo Version 2.0.0
echo ===============================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking MySQL connection...
node scripts/test-connection.js
if %errorlevel% neq 0 (
    echo ERROR: MySQL connection failed
    echo Please check your database configuration in .env file
    pause
    exit /b 1
)

echo Starting TSOAM Church Management System...
echo.
echo The system will be available at:
echo - Local: http://localhost:3001
echo - Network: Check console output for network URLs
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
