# Tutanota Docker Setup

This directory contains Docker configuration for running Tutanota with your MobyPhish enhancements.

## Quick Start

1. **Setup the repository:**
   ```bash
   ./setup-repo.sh
   ```

2. **Start with Docker Compose:**
   ```bash
   ./start-docker.sh
   # or manually:
   docker-compose up --build
   ```

## Branch Switching for Study

The setup supports two branches for your phishing study:

- **`sean-dev1` (default):** Full anti-phishing interface with header banner
- **`no-antiphishing-header`:** No anti-phishing header, only dropdown menu reporting

### Easy Branch Switching

Use the helper script:
```bash
# Switch to the no-header version
./switch-branch.sh no-antiphishing-header

# Switch back to full interface
./switch-branch.sh sean-dev1
```

### Manual Branch Switching

```bash
# Stop current containers
docker-compose down

# Build with specific branch
BUILD_BRANCH=no-antiphishing-header docker-compose up --build -d

# Or for the default branch
BUILD_BRANCH=sean-dev1 docker-compose up --build -d
```

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
1. Fetches latest `tutanota-release-301.250806.1` 
2. Initializes submodules from the release
3. Switches to specified branch (`sean-dev1` or `no-antiphishing-header`)
4. Preserves correct buildSrc files from the release

## Key Differences Between Branches

### `sean-dev1` (Full Anti-Phishing Interface)
- Shows anti-phishing banner in mail view header
- Provides authentication status warnings
- Multiple options: "Known Sender", "Report Phishing", "Learn More"
- Full visual feedback for sender trust status

### `no-antiphishing-header` (Control Group - No Header)
- **No anti-phishing banner displayed**
- Phishing reporting still available via three-dots dropdown menu
- All reports logged to backend database as `reported_phishing`
- Same backend API functionality maintained

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