#!/bin/bash

# Tutanota Docker Startup Script
# This script helps you easily start the Tutanota Docker environment

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

# Check if Docker Compose is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for Docker Compose V2 (plugin)
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_error "Run: sudo apt-get install docker-compose-plugin"
        exit 1
    fi
}

# Check if Docker is running
check_docker_running() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check available RAM
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        available_ram=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [ "$available_ram" -lt 4096 ]; then
            print_warning "Available RAM is less than 4GB. Build might fail."
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        available_ram=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        # Convert pages to MB (assuming 4KB pages)
        available_ram=$((available_ram * 4 / 1024))
        if [ "$available_ram" -lt 4096 ]; then
            print_warning "Available RAM might be less than 4GB. Build might fail."
        fi
    fi
    
    # Check available disk space
    available_space=$(df -m . | awk 'NR==2{print $4}')
    if [ "$available_space" -lt 10240 ]; then
        print_warning "Available disk space is less than 10GB. Build might fail."
    fi
}

# Function to clean up previous containers
cleanup() {
    print_status "Cleaning up previous containers..."
    $DOCKER_COMPOSE_CMD down --volumes --remove-orphans || true
    docker system prune -f || true
}

# Function to build and start services
start_services() {
    print_status "Building and starting Tutanota services..."
    print_status "This may take 15-30 minutes for the first build..."
    
    # Start services
    $DOCKER_COMPOSE_CMD up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check frontend
    if curl -s http://localhost:9000 > /dev/null; then
        print_success "Frontend is running on http://localhost:9000"
    else
        print_error "Frontend is not responding on port 9000"
    fi
    
    # Check backend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Backend is running on http://localhost:3000"
    else
        print_error "Backend is not responding on port 3000"
    fi
    
    # Check CORS proxy
    if curl -s http://localhost:8080 > /dev/null; then
        print_success "CORS proxy is running on http://localhost:8080"
    else
        print_error "CORS proxy is not responding on port 8080"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  --clean         Clean up previous containers before starting"
    echo "  --logs          Show logs after starting"
    echo "  --skip-setup    Skip repository setup (use if already set up)"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                        # Start services normally"
    echo "  $0 --clean               # Clean up and start services"
    echo "  $0 --logs                # Start services and show logs"
    echo "  $0 --skip-setup          # Skip repo setup and start services"
    echo "  $0 --clean --logs        # Clean up, start services, and show logs"
}

# Function to run repository setup
run_repo_setup() {
    print_status "Running repository setup..."
    
    if [ -f "setup-repo.sh" ]; then
        chmod +x setup-repo.sh
        if ./setup-repo.sh; then
            print_success "Repository setup completed successfully"
        else
            print_error "Repository setup failed"
            exit 1
        fi
    else
        print_warning "setup-repo.sh not found, skipping repository setup"
    fi
}

# Main function
main() {
    local clean_flag=false
    local logs_flag=false
    local skip_setup=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                clean_flag=true
                shift
                ;;
            --logs)
                logs_flag=true
                shift
                ;;
            --skip-setup)
                skip_setup=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting Tutanota Docker Environment"
    print_status "======================================"
    
    # Check prerequisites
    check_docker
    check_docker_running
    check_requirements
    
    # Run repository setup unless skipped
    if [ "$skip_setup" != true ]; then
        run_repo_setup
    fi
    
    # Clean up if requested
    if [ "$clean_flag" = true ]; then
        cleanup
    fi
    
    # Start services
    start_services
    
    print_success "Tutanota is now running!"
    print_success "======================================"
    print_success "Frontend: http://localhost:9000"
    print_success "Backend:  http://localhost:3000"
    print_success "CORS:     http://localhost:8080"
    print_success "======================================"
    
    # Show logs if requested
    if [ "$logs_flag" = true ]; then
        print_status "Showing logs (Press Ctrl+C to stop)..."
        $DOCKER_COMPOSE_CMD logs -f
    else
        print_status "To view logs, run: $DOCKER_COMPOSE_CMD logs -f"
        print_status "To stop services, run: $DOCKER_COMPOSE_CMD down"
    fi
}

# Run main function with all arguments
main "$@" 