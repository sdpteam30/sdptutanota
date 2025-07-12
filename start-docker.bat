@echo off
setlocal enabledelayedexpansion

:: Tutanota Docker Startup Script for Windows
:: This script helps you easily start the Tutanota Docker environment

echo Starting Tutanota Docker Environment
echo ======================================

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

:: Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

:: Parse command line arguments
set CLEAN_FLAG=false
set LOGS_FLAG=false

:parse_args
if "%~1"=="--clean" (
    set CLEAN_FLAG=true
    shift
    goto parse_args
)
if "%~1"=="--logs" (
    set LOGS_FLAG=true
    shift
    goto parse_args
)
if "%~1"=="--help" (
    echo Usage: %0 [OPTIONS]
    echo.
    echo OPTIONS:
    echo   --clean     Clean up previous containers before starting
    echo   --logs      Show logs after starting
    echo   --help      Show this help message
    echo.
    echo Examples:
    echo   %0                    # Start services normally
    echo   %0 --clean           # Clean up and start services
    echo   %0 --logs            # Start services and show logs
    echo   %0 --clean --logs    # Clean up, start services, and show logs
    pause
    exit /b 0
)
if "%~1" neq "" (
    echo [ERROR] Unknown option: %1
    pause
    exit /b 1
)

:: Clean up if requested
if "%CLEAN_FLAG%"=="true" (
    echo [INFO] Cleaning up previous containers...
    docker-compose down --volumes --remove-orphans 2>nul
    docker system prune -f 2>nul
)

:: Start services
echo [INFO] Building and starting Tutanota services...
echo [INFO] This may take 15-30 minutes for the first build...
docker-compose up --build -d

:: Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

:: Check service health
echo [INFO] Checking service health...

:: Check frontend
curl -s http://localhost:9000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend is running on http://localhost:9000
) else (
    echo [ERROR] Frontend is not responding on port 9000
)

:: Check backend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend is running on http://localhost:3000
) else (
    echo [ERROR] Backend is not responding on port 3000
)

:: Check CORS proxy
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] CORS proxy is running on http://localhost:8080
) else (
    echo [ERROR] CORS proxy is not responding on port 8080
)

echo.
echo [SUCCESS] Tutanota is now running!
echo ======================================
echo [SUCCESS] Frontend: http://localhost:9000
echo [SUCCESS] Backend:  http://localhost:3000
echo [SUCCESS] CORS:     http://localhost:8080
echo ======================================

:: Show logs if requested
if "%LOGS_FLAG%"=="true" (
    echo [INFO] Showing logs (Press Ctrl+C to stop)...
    docker-compose logs -f
) else (
    echo [INFO] To view logs, run: docker-compose logs -f
    echo [INFO] To stop services, run: docker-compose down
    pause
) 