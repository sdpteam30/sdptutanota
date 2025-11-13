# Multi-stage Dockerfile for Tutanota
FROM node:22-bullseye AS builder

# Build argument to specify which branch to use (default: sean-dev1)
ARG BUILD_BRANCH=sean-dev1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    build-essential \
    cmake \
    wget \
    curl \
	dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default 1.84.0

# Install Emscripten 3.1.59
RUN cd /opt && \
    git clone https://github.com/emscripten-core/emsdk.git && \
    cd emsdk && \
    ./emsdk install 3.1.59 && \
    ./emsdk activate 3.1.59
ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:${PATH}"
ENV EMSDK="/opt/emsdk"

# Install binaryen for WASM2JS
RUN cd /opt && \
    wget https://github.com/WebAssembly/binaryen/releases/download/version_116/binaryen-version_116-x86_64-linux.tar.gz && \
    tar -xzf binaryen-version_116-x86_64-linux.tar.gz && \
    mv binaryen-version_116 binaryen
ENV PATH="/opt/binaryen/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy the entire repository first (including .git and buildSrc)
COPY . .

# Initialize git configuration to avoid issues
RUN git config --global user.email "docker@tutanota.com" && \
    git config --global user.name "Docker Build" && \
    git config --global --add safe.directory /app

# Follow the official building steps from BUILDING.md
RUN if [ -d ".git" ]; then \
        echo "=== Following official build steps from BUILDING.md ===" && \
        echo "Current branch: $(git branch --show-current)" && \
        echo "Step 3: Add upstream remote..." && \
        if ! git remote | grep -q "upstream"; then \
            git remote add upstream https://github.com/tutao/tutanota.git; \
        fi && \
        echo "Step 4: Fetch upstream..." && \
        git fetch upstream --tags && \
        echo "Step 5: Checkout specific release tag..." && \
        echo "Stashing any local changes first..." && \
        git stash push -m "Docker build stash - $(date)" || true && \
        echo "Using specific release: tutanota-release-301.250806.1" && \
        LATEST_RELEASE="tutanota-release-301.250806.1" && \
        echo "Using release: $LATEST_RELEASE" && \
        git checkout "$LATEST_RELEASE" && \
        echo "Steps 6-8: Initialize and update submodules on release branch..." && \
        git submodule init && \
        git submodule sync --recursive && \
        git submodule update && \
        echo "Step 11: Switch to ${BUILD_BRANCH} branch..." && \
        if git show-ref --verify --quiet refs/heads/${BUILD_BRANCH}; then \
            git switch ${BUILD_BRANCH}; \
        elif git show-ref --verify --quiet refs/remotes/origin/${BUILD_BRANCH}; then \
            git switch -c ${BUILD_BRANCH} origin/${BUILD_BRANCH}; \
        else \
            git switch -c ${BUILD_BRANCH}; \
        fi && \
        echo "Final branch: $(git branch --show-current)" && \
        echo "=== Build setup complete ==="; \
    else \
        echo "Warning: Not in a git repository"; \
    fi

# Apply fixes to the env.js file after git checkout
RUN echo "=== Applying env.js fixes ===" && \
    sed -i '/if (networkDebugging == null) missing.push/d' buildSrc/env.js && \
    sed -i 's/networkDebugging:/networkDebugging = false:/' buildSrc/env.js && \
    sed -i 's/const { staticUrl, version, mode, dist, domainConfigs, networkDebugging, clientName }/const { staticUrl, version, mode, dist, domainConfigs, networkDebugging = false, clientName }/' buildSrc/env.js && \
    echo "env.js fixes applied"

# Verify buildSrc is properly set up before npm install
RUN echo "=== Verifying buildSrc before npm install ===" && \
    echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'not in git repo')" && \
    echo "buildSrc directory:" && \
    ls -ld buildSrc && \
    echo "buildSrc contents:" && \
    ls -la buildSrc/ | head -10 && \
    echo "Checking for postinstall.js:" && \
    ls -la buildSrc/postinstall.js && \
    echo "Content preview of postinstall.js:" && \
    head -5 buildSrc/postinstall.js && \
    echo "=== buildSrc verification complete ==="

# Install dependencies (skip all postinstall scripts to avoid linkifyjs issue)
RUN npm ci --ignore-scripts

# Note: linkifyjs files already exist in libs/, no need for updateLibs

# Build packages
RUN npm run build-packages

# Build the web application
RUN node make prod

# Production stage
FROM node:22-alpine AS production

# Install serve globally for serving the frontend
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Copy backend and CORS proxy
COPY --from=builder /app/trusted-senders-backend ./trusted-senders-backend
COPY --from=builder /app/cors-anywhere ./cors-anywhere

# Install backend dependencies
WORKDIR /app/trusted-senders-backend
RUN npm ci --only=production

# Install CORS proxy dependencies
WORKDIR /app/cors-anywhere
RUN npm ci --only=production

# Back to app root
WORKDIR /app

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start trusted-senders-backend in background' >> start.sh && \
    echo 'echo "Starting trusted-senders-backend on port 3000..."' >> start.sh && \
    echo 'cd /app/trusted-senders-backend' >> start.sh && \
    echo 'node index.js &' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start CORS proxy in background' >> start.sh && \
    echo 'echo "Starting CORS proxy on port 8080..."' >> start.sh && \
    echo 'cd /app/cors-anywhere' >> start.sh && \
    echo 'node server.js &' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start frontend server' >> start.sh && \
    echo 'echo "Starting frontend on port 9000..."' >> start.sh && \
    echo 'cd /app/build' >> start.sh && \
    echo 'serve . -s -p 9000 &' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Wait for all background processes' >> start.sh && \
    echo 'wait' >> start.sh

RUN dos2unix start.sh && chmod +x start.sh

# Expose ports
EXPOSE 3000 8080 9000

# Start all services
CMD ["./start.sh"]