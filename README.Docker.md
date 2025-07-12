# Tutanota Docker Setup

This Docker setup provides a complete containerized environment for running the Tutanota web application with all its components.

## Overview

The setup includes three main services:
- **Frontend**: The main Tutanota web application (port 9000)
- **Backend**: Trusted senders backend API (port 3000)
- **CORS Proxy**: CORS-anywhere proxy service (port 8080)

## Prerequisites

- Docker (20.10 or higher)
- Docker Compose (v2.0 or higher)
- At least 4GB of RAM available for Docker
- At least 10GB of disk space

## Quick Start

### Option 1: Using Docker Compose (Recommended)

**Important: Repository Setup Required**

Before running Docker for the first time, you need to ensure your repository is properly set up:

```bash
# 1. First, run the repository setup (interactive)
chmod +x setup-repo.sh
./setup-repo.sh

# 2. Then build and start all services
docker-compose up --build

# Or use the automated startup script (includes setup)
chmod +x start-docker.sh
./start-docker.sh

# Or run in detached mode
./start-docker.sh --clean --logs

# If you've already run setup before, you can skip it
./start-docker.sh --skip-setup
```

### Repository Setup Details

The `setup-repo.sh` script ensures:
- You're in the correct repository (sdpteam30/sdptutanota)
- Upstream remote is configured
- Latest tutanota-release version is checked out
- Git submodules are initialized and updated from the release
- Switches to 'dockerized' branch for development
- Required files are present
- Previous builds are cleaned up (optional)

### Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# 1. Ensure you're in the correct repository
git remote -v
# Should show: origin https://github.com/sdpteam30/sdptutanota.git

# 2. Add upstream remote and fetch all branches/tags
git remote add upstream https://github.com/tutao/tutanota.git
git fetch upstream --all --tags
git fetch origin --all --tags

# 3. Find and checkout latest tutanota-release
LATEST_RELEASE=$(git tag -l "tutanota-release-*" | sort -V | tail -n 1)
echo "Using release: $LATEST_RELEASE"
git checkout "$LATEST_RELEASE"

# 4. Initialize submodules from the release
git submodule init
git submodule sync --recursive
git submodule update

# 5. Switch to dockerized branch
git checkout -b dockerized  # or git checkout dockerized if it exists

# 6. Clean previous builds (optional)
rm -rf build/ dist/ node_modules/

# 7. Now run Docker
docker-compose up --build
```

### Manual Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean rebuild
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up
```

### Option 2: Using Single Dockerfile

```bash
# Build the image
docker build -t tutanota .

# Run the container
docker run -p 9000:9000 -p 3000:3000 -p 8080:8080 tutanota
```

## Services

### Frontend Service
- **Port**: 9000
- **URL**: http://localhost:9000
- **Description**: Main Tutanota web application
- **Health Check**: Visit http://localhost:9000

### Backend Service
- **Port**: 3000
- **URL**: http://localhost:3000
- **Description**: Trusted senders backend API
- **Health Check**: Visit http://localhost:3000

### CORS Proxy Service
- **Port**: 8080
- **URL**: http://localhost:8080
- **Description**: CORS-anywhere proxy for cross-origin requests
- **Health Check**: Visit http://localhost:8080

## Configuration

### Environment Variables

You can customize the setup using environment variables:

```bash
# Backend configuration
BACKEND_PORT=3000
NODE_ENV=production

# CORS proxy configuration
CORS_PORT=8080
CORS_HOST=0.0.0.0
CORSANYWHERE_WHITELIST=http://localhost:9000

# Frontend configuration
FRONTEND_PORT=9000
```

### Docker Compose Override

Create a `docker-compose.override.yml` file to customize the configuration:

```yaml
version: '3.8'

services:
  frontend:
    ports:
      - "3001:9000"  # Change frontend port
    
  backend:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - ./custom-config:/app/config
```

## Development

### Building Individual Services

```bash
# Build frontend only
docker build -f Dockerfile.frontend -t tutanota-frontend .

# Build backend only
docker build -f Dockerfile.backend -t tutanota-backend .

# Build CORS proxy only
docker build -f Dockerfile.cors -t tutanota-cors .
```

### Running Individual Services

```bash
# Frontend
docker run -p 9000:9000 tutanota-frontend

# Backend
docker run -p 3000:3000 tutanota-backend

# CORS proxy
docker run -p 8080:8080 tutanota-cors
```

## Volumes

The setup uses Docker volumes for persistent data:

- `backend-data`: Stores SQLite database and backend data

## Networking

All services are connected via a custom Docker network (`tutanota-network`) for secure inter-service communication.

## Build Process

The Docker build process follows these steps:

1. **Builder Stage** (Dockerfile.frontend):
   - Installs system dependencies (Git, Python, Build tools)
   - Installs Rust and Cargo (1.80+)
   - Installs Emscripten (3.1.59)
   - Installs Binaryen for WASM2JS
   - Clones and builds the application
   - Runs `npm ci` to install dependencies
   - Builds packages with `npm run build-packages`
   - Builds the web application with `node make prod`

2. **Production Stage**:
   - Uses lightweight Node.js Alpine image
   - Copies built application from builder stage
   - Installs only production dependencies
   - Configures and starts services

## Troubleshooting

### Common Issues

1. **Build fails with submodule errors**:
   ```bash
   # Clean up and rebuild
   docker-compose down --volumes
   docker-compose build --no-cache
   ```

2. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :9000
   lsof -i :3000
   lsof -i :8080
   ```

3. **Out of memory during build**:
   ```bash
   # Increase Docker memory limit to 4GB or more
   # Clean up Docker system
   docker system prune -a
   ```

4. **CORS errors**:
   - Make sure the CORS proxy is running on port 8080
   - Check that the whitelist includes your frontend URL

### Logs

View logs for specific services:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs cors-proxy

# Follow logs in real-time
docker-compose logs -f frontend
```

### Health Checks

Check if services are running:

```bash
# Check container status
docker-compose ps

# Check service health
curl http://localhost:9000  # Frontend
curl http://localhost:3000  # Backend
curl http://localhost:8080  # CORS proxy
```

## Security Notes

- The setup is configured for development/testing purposes
- For production use, consider:
  - Using HTTPS
  - Implementing proper authentication
  - Configuring firewalls
  - Using secrets management
  - Regular security updates

## Performance Optimization

For better performance:

1. **Use multi-stage builds** (already implemented)
2. **Optimize .dockerignore** (already implemented)
3. **Use build cache**:
   ```bash
   docker-compose build --pull
   ```
4. **Prune unused resources**:
   ```bash
   docker system prune -a
   ```

## Support

For issues related to:
- Docker setup: Check this README and troubleshooting section
- Tutanota application: Refer to the main project documentation
- Build process: Check `doc/BUILDING.md`

## License

This Docker setup follows the same license as the main Tutanota project (GPL-3.0). 