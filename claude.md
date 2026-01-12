# Claude AI Context File

This file provides context for AI assistants working with this codebase.

## Project Overview

This is a **fork of Tutanota/Tuta Mail** - an open-source encrypted email client. This fork has been customized for the **MobyPhish Study**, a research project investigating anti-phishing user interfaces.

### Key Study Features
- **`sean-dev1` branch**: Full anti-phishing interface with warning banners
- **`no-antiphishing-header` branch**: Control group without security headers
- *** `default-antiphishing-header` branch**: Default version of TutaMail with their header included 
- Custom trusted-senders backend for logging user interactions
- CORS proxy for cross-origin requests

## Tech Stack

- **Frontend**: TypeScript, Mithril.js (virtual DOM framework)
- **Build System**: Node.js with custom build scripts, Rollup
- **Native Crypto**: Rust + WebAssembly (Emscripten)
- **Desktop**: Electron
- **Mobile**: Native Android (Kotlin) and iOS (Swift)
- **Backend (custom)**: Node.js/Express with SQLite

## Prerequisites

- **Node.js**: ≥22.16.0 (check `.nvmrc`)
- **npm**: ≥10.0.0
- **Rust**: 1.84.0 (for crypto primitives)
- **Emscripten**: 3.1.59 (for WASM compilation)
- **Binaryen**: For WASM2JS conversion
- **Git submodules**: liboqs and argon2

## Quick Start (Docker - Recommended)

```bash
# Build and run everything
docker-compose up --build

# Or use the helper script
./switch-branch.sh sean-dev1
```

**Services:**
- Frontend: http://localhost:9000
- Backend API: http://localhost:3000
- CORS Proxy: http://localhost:8080

## Local Development Build

### 1. Initialize Submodules (Required First Time)
```bash
git submodule init
git submodule sync --recursive
git submodule update
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Build Packages (Required Before Webapp)
```bash
npm run build-packages
```

### 4. Build Web Application

```bash
# Development build (uses browser URL as API endpoint)
node make

# Production build (uses Tutanota production server)
node make prod

# Alternative production build command
node webapp prod
```

### 5. Serve the Build
```bash
npx serve build -s -p 9000
```

## Build Scripts

| Script | Description |
|--------|-------------|
| `node make` | Dev build for webapp |
| `node make prod` | Production webapp build |
| `node make -d prod` | Desktop client (dev against production) |
| `node webapp prod` | Alternative production webapp build |
| `node desktop --custom-desktop-release` | Desktop release build |
| `node android` | Android APK build |

## Project Structure

```
src/                    # Main TypeScript source (webapp + desktop)
├── common/api/         # API client, worker thread, crypto, entity handling
├── mail-app/           # Mail application views
├── calendar-app/       # Calendar application
└── ...

app-android/            # Android native code (Kotlin)
app-ios/                # iOS native code (Swift)
buildSrc/               # Build scripts and configuration
libs/                   # Vendored dependencies (reviewed for security)
packages/               # npm workspace packages
test/                   # TypeScript tests
tuta-sdk/               # Rust SDK and crypto primitives

# Custom MobyPhish additions:
trusted-senders-backend/  # Express API for tracking sender trust
cors-anywhere/            # CORS proxy server
```

## Testing

```bash
# Run all TypeScript tests
npm test

# Run only main project tests
npm run test:app

# Run specific tests
npm run test:app -- -f 'CalendarModel'

# Run Rust tests
cargo test --all
```

## Code Style

```bash
# Check formatting
npm run style:check

# Fix formatting
npm run style:fix

# Lint check
npm run lint:check

# Fix linting
npm run lint:fix
```

## Key Conventions

### UI Components (Mithril)
Components use ES6 classes implementing Mithril's `Component` interface:

```typescript
import { Component } from "mithril"

type Attrs = { param1: string }

class MyComponent implements Component<Attrs> {
    view(vnode: Vnode<Attrs>) {
        return m(".class-name", vnode.attrs.param1)
    }
}

// Usage: m(MyComponent, { param1: "value" })
```

### Naming Conventions
- `*View`: Major app views (corresponds to URL routes)
- `*ListVie`w: List display components
- `*Viewer`: Single element display
- `*Model`: Logic for app parts (main thread)
- `*Controller`: Bookkeeping/general actions
- `*Facade`: Domain logic (API/worker thread)
- `*App`: Native communication interfaces

### Architecture
- **Main Thread**: UI, routing, user interaction
- **Worker Thread**: API calls, encryption, indexing
- Communication via `MessageDispatcher` protocol

## MobyPhish Study-Specific

### Backend API Endpoints
- `POST /update-email-status` - Log email interactions
- `GET /email-status/:user_email/:email_id` - Get status
- `GET /trusted-senders/:user_email` - Get trusted list
- `POST /add-trusted` - Add trusted sender

### Status Values Tracked
- `confirmed`, `denied`, `reported_phishing`, `reported_impersonation`
- `trusted_once`, `added_to_trusted`, `removed_from_trusted`

### Switching Study Branches
```bash
./switch-branch.sh sean-dev1              # Full anti-phishing UI
./switch-branch.sh no-antiphishing-header # Control group
```

## Common Issues

### Submodule Error
If you see errors about `liboqs` or `oqs/oqs.h`:
```bash
rm -rf libs/webassembly/include
git submodule update --init --recursive
npm run build-packages
```

### env.js networkDebugging Error
The Docker build applies fixes automatically. For local builds, ensure `networkDebugging` has a default value in `buildSrc/env.js`.

## Important Files

- `buildSrc/env.js` - Environment configuration
- `buildSrc/postinstall.js` - Post-install hooks
- `src/common/api/` - Core API and crypto code
- `Dockerfile` - Main multi-stage build
- `docker-compose.yml` - Full stack orchestration
