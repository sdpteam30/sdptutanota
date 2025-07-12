# Docker Build Fixes Summary

This document summarizes the fixes applied to resolve the Docker build issues, specifically the `npm ci` failures and git repository problems.

## Issues Identified

### 1. Git Repository Issues
- **Problem**: `fatal: not in a git directory`
- **Cause**: Docker build context didn't include `.git` directory
- **Impact**: Build scripts couldn't access git information needed for hooks and configuration

### 2. Missing buildSrc Directory
- **Problem**: `Cannot find module '/app/buildSrc/postinstall.js'`
- **Cause**: buildSrc directory not available during npm install
- **Impact**: npm postinstall script failed, breaking the build

### 3. Repository Origin Issues
- **Problem**: Build might be using wrong repository or branch
- **Cause**: User might be on official Tutanota repo instead of sdpteam30 fork
- **Impact**: Missing custom code and configurations

### 4. Submodule Issues
- **Problem**: Submodules not properly initialized
- **Cause**: Git submodules need proper setup before build
- **Impact**: Missing dependencies for crypto and other modules

## Fixes Applied

### 1. Updated .dockerignore
**File**: `.dockerignore`
```diff
- # Git
- .git/
- .gitignore
+ # Git (commented out - build process needs .git)
+ # .git/
+ # .gitignore
```
**Reason**: Build process needs access to git repository information.

### 2. Updated Dockerfile Build Process
**Files**: `Dockerfile.frontend`, `Dockerfile`

**Changes**:
- Copy entire repository first (including .git and buildSrc)
- Set up git configuration for Docker build
- Initialize submodules before npm install
- Added proper error handling for git operations

```dockerfile
# Copy the entire repository first (including .git and buildSrc)
COPY . .

# Initialize git configuration to avoid issues
RUN git config --global user.email "docker@tutanota.com" && \
    git config --global user.name "Docker Build" && \
    git config --global --add safe.directory /app

# Initialize and update submodules
RUN if [ -d ".git" ]; then \
        git submodule init && \
        git submodule sync --recursive && \
        git submodule update; \
    else \
        echo "Warning: Skipping submodule initialization - not a git repository"; \
    fi

# Install dependencies (now buildSrc is available)
RUN npm ci
```

### 3. Created Repository Setup Script
**File**: `setup-repo.sh`

**Features**:
- Checks if user is in correct repository (sdpteam30/sdptutanota)
- Verifies and sets up upstream remote
- Allows branch switching
- Initializes git submodules
- Validates required files exist
- Cleans up previous builds

### 4. Enhanced Docker Startup Script
**File**: `start-docker.sh`

**New features**:
- Automatically runs repository setup before Docker build
- Added `--skip-setup` option for subsequent runs
- Better error handling and user feedback
- Support for both docker-compose and docker compose commands

### 5. Updated Documentation
**Files**: `README.Docker.md`, `DOCKER_SETUP_SUMMARY.md`

**Added**:
- Repository setup requirements
- Manual setup instructions
- Troubleshooting for common issues
- New command options

## Usage After Fixes

### First Time Setup
```bash
# 1. Run repository setup (interactive)
chmod +x setup-repo.sh
./setup-repo.sh

# 2. Start Docker services
./start-docker.sh
```

### Subsequent Runs
```bash
# Skip setup if already configured
./start-docker.sh --skip-setup

# Or with other options
./start-docker.sh --clean --logs
```

### Manual Docker Commands
```bash
# Direct Docker Compose (after setup)
docker-compose up --build

# Check logs
docker-compose logs -f

# Clean rebuild
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up
```

## Key Improvements

### 1. Build Reliability
- Git repository information available during build
- buildSrc directory accessible for npm scripts
- Submodules properly initialized
- Error handling for missing components

### 2. User Experience
- Automated repository setup
- Clear error messages and guidance
- Interactive branch and repository selection
- Skip options for experienced users

### 3. Compatibility
- Works with both docker-compose and docker compose
- Handles different repository origins
- Supports various git workflows
- Cross-platform scripts (Linux/Mac/Windows)

## Troubleshooting Guide

### If Build Still Fails

1. **Check Repository Origin**:
   ```bash
   git remote -v
   # Should show sdpteam30/sdptutanota
   ```

2. **Verify Required Files**:
   ```bash
   ls -la buildSrc/postinstall.js
   ls -la package.json
   ```

3. **Check Git Status**:
   ```bash
   git status
   git submodule status
   ```

4. **Clean and Rebuild**:
   ```bash
   ./start-docker.sh --clean
   # or
   docker-compose down --volumes
   docker-compose build --no-cache
   ```

5. **Check Docker Resources**:
   - Ensure at least 4GB RAM available
   - Ensure at least 10GB disk space
   - Close other applications if needed

## Expected Build Process

After fixes, the build should proceed as follows:

1. **Repository Setup**: Validates git setup and dependencies
2. **Docker Build**: 
   - Copies entire repository including .git
   - Sets up git configuration
   - Initializes submodules
   - Runs npm ci successfully
   - Builds packages
   - Builds web application
3. **Service Start**: All three services start successfully
4. **Health Check**: Verifies all services are responding

## Success Indicators

You know the fixes worked when you see:
- No "fatal: not in a git directory" errors
- No "Cannot find module buildSrc/postinstall.js" errors
- npm ci completes successfully
- All three services start (ports 3000, 8080, 9000)
- Frontend accessible at http://localhost:9000

These fixes address the core issues preventing the Docker build from completing successfully while maintaining the flexibility and features of the original setup. 