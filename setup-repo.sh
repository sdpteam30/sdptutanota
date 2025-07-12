#!/bin/bash

# Repository Setup Script for Tutanota Docker Build
# This script ensures the repository is properly set up before building with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run this script from the repository root."
        exit 1
    fi
}

# Check if we're in the correct repository
check_repo_origin() {
    local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [[ "$remote_url" == *"sdpteam30/sdptutanota"* ]]; then
        print_success "Repository origin is correct: $remote_url"
    elif [[ "$remote_url" == *"tutao/tutanota"* ]]; then
        print_warning "Repository origin is the official Tutanota repo: $remote_url"
        print_warning "You might want to switch to your fork: github.com/sdpteam30/sdptutanota"
        read -p "Do you want to continue with this repository? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please clone the correct repository or change the origin URL"
            print_error "git remote set-url origin https://github.com/sdpteam30/sdptutanota.git"
            exit 1
        fi
    else
        print_warning "Repository origin: $remote_url"
        print_warning "Expected: github.com/sdpteam30/sdptutanota"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check and set up upstream remote
setup_upstream() {
    if git remote | grep -q "upstream"; then
        print_success "Upstream remote already exists"
        git remote get-url upstream
    else
        print_status "Adding upstream remote..."
        git remote add upstream https://github.com/tutao/tutanota.git
        print_success "Added upstream remote"
    fi
    
    print_status "Fetching all branches and tags from upstream..."
    git fetch upstream --tags
    git fetch origin --tags
}

# Find and checkout latest tutanota release, then switch to dockerized branch
setup_release_and_branch() {
    print_status "Finding latest tutanota-release version..."
    
    # Get all tutanota-release tags, sort them, and get the latest
    local latest_release=$(git tag -l "tutanota-release-*" | sort -V | tail -n 1)
    
    if [ -z "$latest_release" ]; then
        print_error "No tutanota-release tags found. Checking remote tags..."
        # Try to get from upstream remote refs
        latest_release=$(git ls-remote --tags upstream | grep "tutanota-release-" | grep -v "\^{}" | sort -V | tail -n 1 | sed 's/.*refs\/tags\///')
        
        if [ -z "$latest_release" ]; then
            print_error "Could not find any tutanota-release tags"
            print_status "Available tags:"
            git tag -l | head -10
            exit 1
        fi
    fi
    
    print_success "Found latest release: $latest_release"
    
    # Checkout the latest release
    print_status "Checking out $latest_release..."
    if git checkout "$latest_release"; then
        print_success "Successfully checked out $latest_release"
    else
        print_error "Failed to checkout $latest_release"
        exit 1
    fi
    
    # Initialize and update submodules from the release
    print_status "Initializing and updating submodules from release..."
    if [ -f ".gitmodules" ]; then
        git submodule init
        git submodule sync --recursive
        git submodule update
        print_success "Submodules updated successfully from release"
    else
        print_warning "No .gitmodules file found in release"
    fi
    
    # Preserve critical files from release before switching branches
    print_status "Preserving buildSrc files from release..."
    if [ -d "buildSrc" ]; then
        cp -r buildSrc buildSrc.release.backup
        print_success "Backed up buildSrc files from release"
    fi
    
    # Now switch to dockerized branch
    print_status "Switching to 'dockerized' branch..."
    if git show-ref --verify --quiet refs/heads/dockerized; then
        # Branch exists locally
        git checkout dockerized
        print_success "Switched to existing 'dockerized' branch"
    elif git show-ref --verify --quiet refs/remotes/origin/dockerized; then
        # Branch exists on remote
        git checkout -b dockerized origin/dockerized
        print_success "Checked out 'dockerized' branch from remote"
    else
        # Create new branch from current state (release + submodules)
        git checkout -b dockerized
        print_success "Created new 'dockerized' branch from $latest_release"
    fi
    
    # Restore buildSrc files from release if they were overwritten
    if [ -d "buildSrc.release.backup" ]; then
        if [ -d "buildSrc" ]; then
            # Check if buildSrc was modified by branch switch
            if ! diff -rq buildSrc buildSrc.release.backup > /dev/null 2>&1; then
                print_warning "buildSrc files differ between release and dockerized branch"
                print_status "Restoring buildSrc files from release..."
                rm -rf buildSrc
                mv buildSrc.release.backup buildSrc
                print_success "Restored buildSrc files from $latest_release"
            else
                print_success "buildSrc files are identical - no restoration needed"
                rm -rf buildSrc.release.backup
            fi
        else
            print_warning "buildSrc missing after branch switch - restoring from release"
            mv buildSrc.release.backup buildSrc
            print_success "Restored buildSrc files from $latest_release"
        fi
    fi
    
    print_status "Current branch: $(git branch --show-current)"
    print_status "Based on release: $latest_release"
}

# Verify submodules are properly set up (called after branch setup)
verify_submodules() {
    print_status "Verifying submodules are properly initialized..."
    
    if [ -f ".gitmodules" ]; then
        # Check if submodules are initialized
        if git submodule status | grep -q "^-"; then
            print_warning "Some submodules not initialized, updating..."
            git submodule init
            git submodule sync --recursive
            git submodule update
        fi
        print_success "Submodules verified and ready"
    else
        print_warning "No .gitmodules file found"
    fi
}

# Check for required files
check_required_files() {
    print_status "Checking for required files..."
    
    local required_files=(
        "package.json"
        "buildSrc/postinstall.js"
        "buildSrc/buildPackages.js"
        "trusted-senders-backend/package.json"
        "cors-anywhere/package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing: $file"
            exit 1
        fi
    done
}

# Clean up any previous builds
cleanup_builds() {
    print_status "Cleaning up previous builds..."
    
    # Remove build artifacts
    rm -rf build/
    rm -rf dist/
    rm -rf node_modules/
    rm -rf trusted-senders-backend/node_modules/
    rm -rf cors-anywhere/node_modules/
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Main function
main() {
    print_status "Setting up Tutanota repository for Docker build"
    print_status "================================================="
    
    check_git_repo
    check_repo_origin
    setup_upstream
    setup_release_and_branch
    verify_submodules
    check_required_files
    
    # Ask if user wants to clean up
    echo ""
    read -p "Do you want to clean up previous builds? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup_builds
    fi
    
    print_success "Repository setup completed!"
    print_success "================================================="
    print_success "You can now run Docker build:"
    print_success "  ./start-docker.sh"
    print_success "  or"
    print_success "  docker-compose up --build"
}

# Run main function
main "$@" 