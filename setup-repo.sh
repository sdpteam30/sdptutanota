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
    
    print_status "Fetching upstream branches..."
    git fetch upstream
}

# Check current branch
check_branch() {
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    # List available branches
    print_status "Available branches:"
    git branch -a | head -10
    
    # Ask user about branch
    echo ""
    print_status "Make sure you're on the correct branch for your development work."
    print_status "Common branches: main, develop, sean-dev, my-testing-branch"
    
    read -p "Do you want to switch to a different branch? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter branch name: " branch_name
        if git show-ref --verify --quiet refs/heads/"$branch_name"; then
            git checkout "$branch_name"
            print_success "Switched to branch: $branch_name"
        elif git show-ref --verify --quiet refs/remotes/origin/"$branch_name"; then
            git checkout -b "$branch_name" origin/"$branch_name"
            print_success "Checked out remote branch: $branch_name"
        else
            print_error "Branch '$branch_name' does not exist"
            exit 1
        fi
    fi
}

# Initialize and update submodules
setup_submodules() {
    print_status "Initializing and updating submodules..."
    
    if [ -f ".gitmodules" ]; then
        git submodule init
        git submodule sync --recursive
        git submodule update
        print_success "Submodules updated successfully"
    else
        print_warning "No .gitmodules file found, skipping submodule setup"
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
    check_branch
    setup_submodules
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