@echo off
setlocal EnableDelayedExpansion

echo =======================================================================
echo               FacilityDesk Windows Startup Script            
echo =======================================================================
echo.

:: 1. System Dependencies
echo [SEARCHING] Checking System Dependencies...

:: Check for Winget
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] 'winget' command not found. Automatic installations might fail.
    echo Please install Windows App Installer from the Microsoft Store.
)

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Python 3 not found. Installing via winget...
    winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements
    echo [INFO] Python installed. You may need to restart the script or terminal to refresh the PATH.
    pause
    exit /b
) else (
    echo [OK] Python is already installed.
)

:: Check Node.js
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js (npm) not found. Installing via winget...
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    echo [INFO] Node.js installed. You may need to restart the script or terminal to refresh the PATH.
    pause
    exit /b
) else (
    echo [OK] Node.js is already installed.
)

:: Check Redis
where redis-server >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis is required for background tasks but not found in PATH.
    echo Please ensure Redis is running via WSL or Memurai on port 6379.
) else (
    echo [OK] Redis is installed.
)

echo.
:: 2. Backend Setup
if exist "backend" (
    echo [INFO] Setting up Backend...
    cd backend
    
    if not exist ".env" (
        if exist ".env.example" (
            copy .env.example .env >nul
            echo [OK] Created .env from template
        )
    )

    if not exist "venv" (
        echo [INFO] Creating Python virtual environment...
        python -m venv venv
    )

    echo [INFO] Installing Python dependencies...
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip >nul
    
    if exist "requirements.txt" (
        pip install -r requirements.txt
    ) else if exist "pyproject.toml" (
        pip install poetry
        poetry install
    )
    
    echo [INFO] Starting Backend server in a new window...
    start "FacilityDesk Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    echo [INFO] Starting Celery Worker in a new window...
    start "FacilityDesk Celery" cmd /c "call venv\Scripts\activate.bat && celery -A celery_worker.celery_app worker --loglevel=info -P solo"
    
    cd ..
) else (
    echo [ERROR] 'backend' directory not found.
    exit /b
)

echo.
:: 3. Frontend Setup
if exist "app" (
    echo [INFO] Setting up Frontend...
    cd app
    
    if not exist ".env" (
        echo VITE_API_BASE_URL=http://localhost:8000/api> .env
        echo VITE_APP_ENV=development>> .env
        echo [OK] Created default frontend .env
    )

    if not exist "node_modules" (
        echo [INFO] Installing frontend dependencies...
        call npm install
    )

    echo [INFO] Starting Frontend server in a new window...
    start "FacilityDesk Frontend" cmd /c "npm run dev"
    
    cd ..
) else (
    echo [ERROR] 'app' directory not found.
    exit /b
)

echo.
echo =======================================================================
echo                      All Servers Started!                    
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
echo Three new console windows have been opened for the servers and background worker.
echo To stop the servers, close those console windows.
echo =======================================================================
pause
