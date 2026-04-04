# Claude AI Context File

This file provides context for AI assistants working with this codebase.

## Project Overview

This is a **fork of Tutanota/Tuta Mail** - an open-source encrypted email client. This fork has been customized for the **MobyPhish Study**, a research project investigating anti-phishing user interfaces.

### Key Study Features
- **`sean-dev1` branch**: Full anti-phishing interface with warning banners
- **`no-antiphishing-header` branch**: Control group without security headers
- **`default-antiphishing-header` branch**: Default version of TutaMail with their header included
- **`db-dev` branch**: Assignment tracking + `email_opened` logging; adds `/assignment-by-sender` backend route and frontend hook to correlate opened emails with study assignments
- Custom trusted-senders backend for logging user interactions
- CORS proxy for cross-origin requests

## Tech Stack

- **Frontend**: TypeScript, Mithril.js (virtual DOM framework)
- **Build System**: Node.js with custom build scripts, Rollup
- **Native Crypto**: Rust + WebAssembly (Emscripten)
- **Desktop**: Electron
- **Mobile**: Native Android (Kotlin) and iOS (Swift)
- **Backend (custom)**: Node.js/Express with Supabase (PostgreSQL)

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

See [doc/BUILDING.md](doc/BUILDING.md) for official build prerequisites and release builds.
See [doc/HACKING.md](doc/HACKING.md) for development workflow and code structure.

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
# Local/network build (recommended - allows domain config resolution)
node make local

# Development build (uses browser URL as API endpoint)
node make

# Production build (uses Tutanota production server)
node make prod
```

**Important:** For network access (accessing from remote browser via IP), use `node make local` which sets `staticUrl: null` allowing the app to use domain configs for CORS proxy routing.

### 5. Start Backend Services

Before serving the frontend, start the required backend services:

```bash
# Terminal 1: Start CORS proxy (required for Tuta API and trusted-senders-backend)
cd cors-anywhere
node server.js
# Runs on port 8080

# Terminal 2: Start trusted-senders-backend
cd trusted-senders-backend
node index.js
# Runs on port 3000
```

### 6. Serve the Frontend
```bash
cd build
python3 -m http.server 9000
# Or: npx serve build -s -p 9000
```

### Network Access (Remote Browser)

When accessing from a remote browser (e.g., `http://10.252.16.42:9000`):

1. **Tuta API calls** route through CORS proxy: `http://10.252.16.42:8080/https://app.tuta.com`
2. **Trusted-senders-backend calls** route through CORS proxy: `http://10.252.16.42:8080/http://localhost:3000`

This is handled automatically by:
- `DomainConfigs.js` - defines CORS proxy URLs for known hostnames
- `ServerHostUtils.ts` - routes backend calls through CORS proxy for remote access
- `RestClient.ts` - properly appends paths to CORS proxy URLs

## Build Scripts

| Script | Description |
|--------|-------------|
| `node make` | Dev build (uses browser URL as API endpoint) |
| `node make local` | Network access build (staticUrl=null, uses domain configs) |
| `node make prod` | Production build (staticUrl=null for network access) |
| `node make -d prod` | Desktop client (dev against production) |
| `node webapp prod` | Alternative production webapp build |
| `node desktop --custom-desktop-release` | Desktop release build |
| `node android` | Android APK build |

**Build Stages Explained:**
- `make` / `make local`: Sets `staticUrl: null` - app uses `window.location` and `DomainConfigs.js` to determine API URLs. Required for network access with CORS proxy.
- `make prod`: Also sets `staticUrl: null` for network builds.
- When `staticUrl` is set to a URL (e.g., `https://app.tuta.com`), domain configs are bypassed.

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
- `*ListView`: List display components
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

### CORS Proxy (`cors-anywhere/`)

The CORS proxy is required for:
1. Proxying Tuta API requests (browser can't directly call `https://app.tuta.com` due to CORS)
2. Proxying trusted-senders-backend requests when accessing remotely

**Configuration:** `cors-anywhere/server.js`
- Listens on port 8080
- Allows origins: `localhost:9000`, any IP address on port 9000
- Proxies requests by appending target URL to path (e.g., `/https://app.tuta.com/rest/...`)

**Start:** `cd cors-anywhere && node server.js`

### Trusted Senders Backend (`trusted-senders-backend/`)

Express.js API server that logs user interactions with email senders to Supabase.

**Configuration:** Requires `.env` file with Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Start:** `cd trusted-senders-backend && node index.js` (port 3000)

### Backend API Endpoints
- `POST /update-email-status` - Log email interactions
- `GET /email-status/:user_email/:email_id` - Get status
- `GET /trusted-senders/:user_email` - Get trusted list
- `POST /add-trusted` - Add trusted sender
- `POST /remove-trusted` - Remove trusted sender
- `POST /validate-sender-email` - Validate sender email against known addresses
- `POST /reset-email-statuses` - Clear statuses (debugging/testing)

### Status Values Tracked
- `confirmed`, `denied`, `reported_phishing`, `reported_impersonation`
- `trusted_once`, `added_to_trusted`, `removed_from_trusted`

### Switching Study Branches
```bash
./switch-branch.sh db-dev                       # Assignment tracking + email_opened logging
./switch-branch.sh sean-dev1                    # Full anti-phishing UI
./switch-branch.sh default-antiphishing-header  # Default Tuta header
./switch-branch.sh no-antiphishing-header       # Control group
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

### CORS Errors When Accessing Remotely
If you see CORS errors when accessing from a remote browser:
1. Ensure CORS proxy is running: `cd cors-anywhere && node server.js`
2. Ensure you built with `node make local` (not just `node make`)
3. Check that `DomainConfigs.js` has an entry for your IP address, or uses the `{hostname}` fallback
4. Clear browser cache/service workers (DevTools → Application → Clear site data)

### Trusted Senders Backend Not Loading
If trusted senders requests fail from remote browser:
1. Ensure backend is running: `cd trusted-senders-backend && node index.js`
2. Requests should route through CORS proxy (check Network tab for `http://IP:8080/http://localhost:3000/...`)
3. The backend itself only needs to be accessible from localhost (CORS proxy handles remote access)

### Browser Cache Issues
After rebuilding, if changes don't appear:
1. Hard refresh: `Ctrl+Shift+R`
2. If still not working, clear service workers and site data:
   - DevTools → Application → Storage → Clear site data
3. Incognito mode always works (no cached assets)

## Important Files

### Build Configuration
- `buildSrc/env.js` - Environment configuration
- `buildSrc/buildWebapp.js` - Webapp build script (sets `staticUrl`)
- `buildSrc/DomainConfigs.js` - Domain-specific API URL configs (CORS proxy routing)
- `buildSrc/postinstall.js` - Post-install hooks

### Core Code
- `src/common/api/` - Core API and crypto code
- `src/common/api/worker/rest/RestClient.ts` - HTTP client (handles CORS proxy URL construction)
- `src/common/api/common/ServerHostUtils.ts` - Server host/origin detection (CORS proxy routing for backend)

### MobyPhish Custom
- `trusted-senders-backend/index.js` - Backend API server
- `trusted-senders-backend/.env` - Supabase credentials (not in git)
- `cors-anywhere/server.js` - CORS proxy server
- `src/mail-app/mail/view/MailViewerViewModel.ts` - Email viewer with trust UI
- `src/mail-app/mail/model/TrustedSendersService.ts` - Backend API client (some branches)

### Docker
- `Dockerfile` - Main multi-stage build
- `Dockerfile.frontend` - Frontend-only build
- `docker-compose.yml` - Full stack orchestration
