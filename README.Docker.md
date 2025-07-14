# Tutanota Docker Setup

This directory contains Docker configuration for running Tutanota with your MobyPhish enhancements.

## Quick Start

1. (OPTIONAL - only use if switching branches) **Setup the repository:**
   ```bash
   ./setup-repo.sh
   #if this doesn't run initially on Linux, try runnning 'chmod +x setup-repo.sh'.
   ```


2. **Start with Docker Compose:**
   ```bash
   ./start-docker.sh #if this doesn't run initially on Linux, try runnning 'chmod +x start-docker.sh'.
	# or manually:
   docker-compose up --build
   ```
   On Windows:
   First, ensure that batch files can be run by running 'Get-ExecutionPolicy' in PowerShell with admin. privileges. Save this result then use 'Set-ExecutionPolicy Unrestricted -Scope CurrentUser' to bypass Windows restrictions against running unsigned scripts.

   Next, run:
   ```
   ./start-docker.bat
   # or manually:
   docker compose up --build
   ```
   For safety, you should set your Execution Policy in Windows back to the initial result of 'Get-ExecutionPolicy' once
   the Docker container is configured. This can be done by replacing 'Unrestricted' in the command with the result of
   the first command (Get-ExecutionPolicy).

## Services

- **Frontend (Port 9000):** Main Tutanota web application
- **Backend (Port 3000):** trusted-senders-backend API for MobyPhish functionality
- **CORS Proxy (Port 8080):** CORS-anywhere proxy for cross-origin requests

## Docker Compose Options

### All-in-One (Default)
```bash
docker-compose up --build
```
Runs all services in a single container.

### Frontend Only
```bash
docker-compose --profile frontend-only up --build
```
Runs only the frontend service on port 9001.

## Repository Workflow

The setup automatically:
1. Fetches latest `tutanota-release-296.250709.0`
2. Initializes submodules from the release
3. Switches to `dockerized` branch for your customizations
4. Preserves correct buildSrc files from the release

## Build Process

The Docker build follows the standard Tutanota build process:
1. `npm ci` - Clean install dependencies
2. `npm run build-packages` - Build packages
3. `node make prod` - Build web application

All previous builds are automatically overwritten - no manual cleanup needed.

## Accessing the Application

- **Tutanota Web App:** http://localhost:9000
- **Backend API:** http://localhost:3000
- **CORS Proxy:** http://localhost:8080

## Stopping Services

```bash
docker-compose down
```

## Rebuilding

```bash
docker-compose up --build --force-recreate
```

## Troubleshooting

If you encounter issues:
1. Check that all required files exist by running `./setup-repo.sh`
2. Ensure Docker and Docker Compose are installed
3. Make sure ports 3000, 8080, and 9000 are available
4. Check Docker logs: `docker-compose logs -f`