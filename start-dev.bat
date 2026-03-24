@echo off
REM Photography Marketplace - Development Startup Script (Windows)

echo ====================================================
echo   Photography Marketplace - Development Startup
echo ====================================================
echo.

echo Step 1: Checking PostgreSQL...
sc query postgresql-x64-14 | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running
) else (
    echo [ERROR] PostgreSQL is not running
    echo.
    echo Please start PostgreSQL service:
    echo   1. Press Win + R
    echo   2. Type: services.msc
    echo   3. Find PostgreSQL service
    echo   4. Right-click and select Start
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Checking backend dependencies...
if not exist "backend\node_modules\" (
    echo [WARNING] Backend dependencies not installed
    echo.
    set /p install="Install backend dependencies now? (y/n): "
    if /i "%install%"=="y" (
        cd backend
        call npm install
        cd ..
        echo [OK] Backend dependencies installed
    ) else (
        echo [ERROR] Backend dependencies required
        pause
        exit /b 1
    )
) else (
    echo [OK] Backend dependencies installed
)

echo.
echo Step 3: Checking frontend dependencies...
if not exist "node_modules\" (
    echo [WARNING] Frontend dependencies not installed
    echo.
    set /p install="Install frontend dependencies now? (y/n): "
    if /i "%install%"=="y" (
        call npm install
        echo [OK] Frontend dependencies installed
    ) else (
        echo [ERROR] Frontend dependencies required
        pause
        exit /b 1
    )
) else (
    echo [OK] Frontend dependencies installed
)

echo.
echo ====================================================
echo   All checks passed! Starting development servers
echo ====================================================
echo.
echo Opening 2 command windows:
echo   1. Backend server (port 5000)
echo   2. Frontend server (port 5173)
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ====================================================
echo   Next Steps:
echo ====================================================
echo.
echo 1. Wait for both servers to start (10-30 seconds)
echo 2. Open browser: http://localhost:5173
echo 3. Login with: admin@gmail.com / admin123
echo.
echo Seeded credentials:
echo   Admin: admin@gmail.com / admin123
echo.
echo Documentation:
echo   - STARTUP_CHECKLIST.md - Detailed setup guide
echo   - QUICKSTART.md - Quick start guide
echo   - ERROR_FIXES.md - Troubleshooting
echo.
echo Press any key to exit this window...
pause >nul
