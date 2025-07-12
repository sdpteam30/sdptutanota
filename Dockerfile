# Multi-stage Dockerfile for Tutanota
FROM node:20-bullseye AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    build-essential \
    cmake \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default 1.80.0

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

# Copy package files
COPY package*.json ./
COPY packages/ ./packages/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Initialize and update submodules
RUN git submodule init && \
    git submodule sync --recursive && \
    git submodule update

# Build packages
RUN npm run build-packages

# Build the web application
RUN node make prod

# Production stage
FROM node:20-alpine AS production

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
RUN cat > start.sh << 'EOF'
#!/bin/sh
set -e

# Start trusted-senders-backend in background
echo "Starting trusted-senders-backend on port 3000..."
cd /app/trusted-senders-backend
node index.js &

# Start CORS proxy in background
echo "Starting CORS proxy on port 8080..."
cd /app/cors-anywhere
node server.js &

# Start frontend server
echo "Starting frontend on port 9000..."
cd /app/build
serve . -s -p 9000 &

# Wait for all background processes
wait
EOF

RUN chmod +x start.sh

# Expose ports
EXPOSE 3000 8080 9000

# Start all services
CMD ["./start.sh"] 