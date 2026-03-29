#!/bin/bash

# Helper script to switch between branches for MobyPhish study
# Usage: ./switch-branch.sh [branch-name]
# 
# Available branches:
#   sean-dev1 (default) - Full MobyPhish anti-phishing interface with custom header
#   default-antiphishing-header - Default Tutanota anti-phishing header (upstream)
#   no-antiphishing-header - No anti-phishing header, only dropdown reporting

set -e

BRANCH=${1:-sean-dev1}

echo "=================================================="
echo "MobyPhish Branch Switcher"
echo "=================================================="
echo ""
echo "Building Tutanota Mail Client with branch: $BRANCH"
echo ""
echo "This will:"
echo "  1. Stop any running containers"
echo "  2. Build the application from branch '$BRANCH'"
echo "  3. Start the services"
echo ""
echo "Available branches:"
echo "  - sean-dev1 (default): Full MobyPhish anti-phishing interface with custom header"
echo "  - default-antiphishing-header: Default Tutanota anti-phishing header (upstream)"
echo "  - no-antiphishing-header: No anti-phishing header, dropdown reporting only"
echo ""
echo "=================================================="
echo ""

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start with specified branch
echo "Building with branch: $BRANCH"
BUILD_BRANCH=$BRANCH docker-compose up --build -d

echo ""
echo "=================================================="
echo "Build complete!"
echo "=================================================="
echo ""
echo "Services are now running:"
echo "  - Frontend: http://localhost:9000"
echo "  - Backend API: http://localhost:3000"
echo "  - CORS Proxy: http://localhost:8080"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""

