<div align="center">
	<a href="https://tuta.com/" target="_blank"><img src="resources/images/logo-red.svg" alt="Tuta Mail logo" width="300"></a>
	<br/>
	<h1>Tuta Mail — MobyPhish Study Fork</h1>
	<p>
		Tuta Mail is the <a href="https://tuta.com">secure email</a> service with built-in end-to-end encryption.
		<br/>
		This fork adds the <strong>MobyPhish</strong> anti-phishing research interface for a controlled user study.
	</p>
</div>

<div align="center">
<a href="https://play.google.com/store/apps/details?id=de.tutao.tutanota"><img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" height="75"></a><a href="https://f-droid.org/packages/de.tutao.tutanota/"><img src="https://f-droid.org/badge/get-it-on.png" height="75"></a>

<a href="https://app.tuta.com">Web client</a>
•
<a href="https://itunes.apple.com/us/app/tutanota/id922429609">iOS App Store</a>
•
<a href="https://tuta.com/#download">Desktop Client</a>

</div>

---

- **Forum:** https://www.reddit.com/r/tutanota
- **Roadmap:** https://tuta.com/roadmap/
- **Issues:** https://github.com/tutao/tutanota/issues

---

## Table of Contents

- [**MobyPhish Frontend UI (Core Development)**](#mobyphish-frontend-ui-core-development)
- [Quick Start (Docker)](#quick-start-docker)
- [Architecture Overview](#architecture-overview)
- [Study Branches](#study-branches)
- [Branch Switching](#branch-switching)
- [Building the Web Client](#building-the-web-client)
- [Building with Backend Services (Manual)](#building-with-backend-services-manual)
- [Docker Setup In-Depth](#docker-setup-in-depth)
- [Domain Config System](#domain-config-system)
- [Distribution / Deployment](#distribution--deployment)
- [Developing Tuta (Hacking)](#developing-tuta-hacking)
- [Building Android](#building-android)
- [Building iOS](#building-ios)
- [Building Desktop](#building-desktop)
- [Testing](#testing)
- [Trusted Sender Security](#trusted-sender-security)
- [Backend API Reference](#backend-api-reference)
- [Troubleshooting](#troubleshooting)
- [Translating](#translating)

---

## MobyPhish Frontend UI (Core Development)

The primary development work in this fork lives in [`src/mail-app/mail/view/`](src/mail-app/mail/view/). This directory contains all the custom MobyPhish UI components — the anti-phishing banner, modal dialogs, domain replacement system, and the view model extensions that tie them to the backend.

### User Flow Overview

When a user opens an email, the MobyPhish system activates:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  User clicks an email in the Mail List                                      │
│    ↓                                                                        │
│  MailViewerViewModel initializes and calls fetchSenderData()                │
│  (Fetches trusted_senders and email_status from MobyPhish backend)          │
│    ↓                                                                        │
│  MailViewerHeader renders the MobyPhish banner based on senderStatus:       │
│    ├─ "confirmed" → "Confirmed" banner                                      │
│    ├─ "reported_*" → "Reported" banner                                      │
│    └─ "" (Unknown) → Warning banner with red border:                        │
│                      "Does this email seem to be from a known sender?"      │
│         ├─ Click "Show Blocked Content" → Sets "trusted_once" status        │
│         ├─ Click "Known Sender" → Opens "Unknown Sender Detected" modal     │
│         │                         (Shows green "Confirm" button)            │
│         ├─ Click "Report phishing" → Opens "Report Email" modal             │
│         │                            (Shows red "Report Phishing" button)   │
│         └─ Click "Learn more..." → Opens Info Modal                         │
│                                                                             │
│  MailViewer renders the email body (Shadow DOM) and handles links:          │
│    ├─ If sender is unknown:                                                 │
│    │    └─ Links are crossed out and visually disabled                      │
│    │    └─ Clicking a link prompts the "Unknown Sender Detected" modal      │
│    ├─ If "trusted_once":                                                    │
│    │    └─ Links look normal, but clicking prompts the Confirm Modal        │
│    └─ If "confirmed":                                                       │
│         └─ Links open normally in a new tab                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Custom MobyPhish Files

All custom files are prefixed with `MobyPhish` or `DomainReplacement` for easy identification.

#### Modal Components

| File | Purpose |
|------|---------|
| [MobyPhishConfirmSenderModal.ts](src/mail-app/mail/view/MobyPhishConfirmSenderModal.ts) | **Primary modal** — shown when a user clicks "Known Sender" for an untrusted email. Presents a dropdown of existing trusted senders and a custom-name text input. Validates email against known sender names via `/validate-sender-email`, or adds a new trusted sender via `/add-trusted`. Also offers an inline "Report as Phishing" fallback when email validation fails. |
| [MobyPhishReportModal.ts](src/mail-app/mail/view/MobyPhishReportModal.ts) | **Report modal** — two-step dialog for reporting emails. Step 1 asks the user to confirm they want to report; Step 2 confirms the report type. Calls `/update-email-status` with `reported_phishing` or `reported_impersonation` and moves all emails from that sender to the spam folder. |
| [MobyPhishReportPhishingModal.ts](src/mail-app/mail/view/MobyPhishReportPhishingModal.ts) | **Alternative report modal** — simpler phishing report dialog with "Report as Phishing" and "Add as Trusted Sender" buttons. Used as an entry point from the three-dots dropdown menu (available in both study branches). |
| [MobyPhishAlreadyTrustedModal.ts](src/mail-app/mail/view/MobyPhishAlreadyTrustedModal.ts) | **Confirmation feedback** — brief modal shown when a user clicks "Known Sender" and the email address is already in their trusted list. Displays "Sender confirmed as known" and auto-confirms status. |
| [MobyPhishInfoModal.ts](src/mail-app/mail/view/MobyPhishInfoModal.ts) | **Educational modal** — explains how MobyPhish protects against phishing. Describes what Moby does (identifies known senders, blocks interactions until confirmed, uses cryptographic verification). Triggered by the "Learn More" banner button. |
| [MobyPhishReminderModal.ts](src/mail-app/mail/view/MobyPhishReminderModal.ts) | **Reminder modal** — shown when a user attempts to interact with email content (e.g., click a link) before confirming the sender. Prompts: "Please confirm the email using the banner above before clicking links or attachments." |
| [MobyPhishModal.ts](src/mail-app/mail/view/MobyPhishModal.ts) | **Base modal** — simple reusable confirmation modal. Takes a message string and displays it with a Close button. Used as a generic action confirmation dialog. |

#### Domain Replacement System

The domain replacement system disguises the actual Tuta email addresses used in the study so that participants see realistic-looking sender addresses (e.g., `citytrust@citytrust.com` instead of `citytrust@tuta.com`).

| File | Purpose |
|------|---------|
| [DomainReplacementConfig.ts](src/mail-app/mail/view/DomainReplacementConfig.ts) | **Configuration** — defines all email replacement mappings for the study. Contains exact email-to-email mappings for legitimate senders (e.g., `citytrust@tuta.com` → `citytrust@citytrust.com`) and phishing senders (e.g., `8ankeasy@tuta.com` → `citytrust@citytrustbank.com`). This is the only file you need to edit to add or change study email addresses. |
| [DomainReplacementUtils.ts](src/mail-app/mail/view/DomainReplacementUtils.ts) | **Core utilities** — provides `replaceEmailDomain()` and `replaceMailAddressDomain()` functions. Supports two layers: exact email replacements (highest priority, case-insensitive) and domain-wide replacements (fallback). |
| [DomainReplacementTest.ts](src/mail-app/mail/view/DomainReplacementTest.ts) | **Test file** — demonstrates and verifies domain replacement functionality. |
| [MailAddressDisplayUtils.ts](src/mail-app/mail/view/MailAddressDisplayUtils.ts) | **Display helpers** — enhanced versions of the original mail address display functions that apply domain replacement. Provides `getDisplayedSenderWithDomainReplacement()` used throughout the MobyPhish code. |
| [DOMAIN_REPLACEMENT_README.md](src/mail-app/mail/view/DOMAIN_REPLACEMENT_README.md) | **Detailed reference** — additional documentation specific to the domain replacement feature. |

#### Adding New Study Email Addresses

To add a new email mapping for the study, edit [DomainReplacementConfig.ts](src/mail-app/mail/view/DomainReplacementConfig.ts):

```typescript
// Legitimate sender
addEmailReplacement("realaccount@tuta.com", "display@company.com")

// Phishing sender
addEmailReplacement("phishaccount@tuta.com", "display@compnay.com")  // note the typo
```

### Modified Upstream Files

These are existing Tuta Mail files that were modified to integrate MobyPhish functionality:

| File | What Changed |
|------|-------------|
| [MailViewerHeader.ts](src/mail-app/mail/view/MailViewerHeader.ts) | **Banner rendering** — added `renderMobyPhishBanner()` method that replaces the default Tuta authentication banners. Renders a context-aware `InfoBanner` with buttons (Known Sender, Report Phishing, Show Blocked Content, Learn More) based on `senderStatus`. Handles one-click confirmation for already-trusted senders. This is the main integration point where the banner UI lives. |
| [MailViewerViewModel.ts](src/mail-app/mail/view/MailViewerViewModel.ts) | **Backend integration** — added `TRUSTED_SENDERS_API_URL` constant, `senderStatus` state tracking, `fetchSenderData()` to load trusted senders and email status from the backend on email open, `updateSenderStatus()` to push status changes, `TrustedSenderInfo` type, and `isSenderNameTrusted()` check. All backend communication flows through this view model. |
| [MailViewer.ts](src/mail-app/mail/view/MailViewer.ts) | **Content blocking** — modified to integrate with MobyPhish content blocking. Intercepts link clicks and attachment opens to show `MobyPhishReminderModal` when the sender hasn't been confirmed yet. |
| [CollapsedMailView.ts](src/mail-app/mail/view/CollapsedMailView.ts) | **Sender display** — updated to use `getDisplayedSenderWithDomainReplacement()` so collapsed mail items show the replaced domain. |
| [MailViewerUtils.ts](src/mail-app/mail/view/MailViewerUtils.ts) | **Recipient display** — updated to use domain replacement in recipient and sender display functions. |
| [MailGuiUtils.ts](src/mail-app/mail/view/MailGuiUtils.ts) | **Report menu integration** — added "Report Email" option to the three-dots dropdown menu (⋮), which opens `MobyPhishReportPhishingModal`. Available in all study branches. |

### Key Constants and Types

Defined in [MailViewerViewModel.ts](src/mail-app/mail/view/MailViewerViewModel.ts):

```typescript
// API URL — automatically resolves based on CORS proxy location
export const TRUSTED_SENDERS_API_URL = getTrustedSendersApiUrl()

// Trusted sender info returned from backend
export type TrustedSenderInfo = {
    address: string
    name?: string
}
```

### Logging

All MobyPhish interactions are logged with the `🔒 MOBYPHISH_LOG:` prefix for easy filtering:

```bash
# In browser console
# 🔒 MOBYPHISH_LOG: Known sender button clicked for sender="citytrust@citytrust.com"
# 🔒 MOBYPHISH_LOG: Email validation passed - actualEmail="citytrust@citytrust.com" matches known sender "CityTrust"
# 🔒 MOBYPHISH_LOG: Successfully reported phishing for sender="attacker@evil.com"

# In Docker logs
docker-compose logs | grep "MOBYPHISH_LOG"
```

---

## Quick Start (Docker)

The fastest way to run the full MobyPhish stack:

```bash
# Build and start all services (frontend + backend + CORS proxy)
docker-compose up --build

# Or use the branch-switching helper:
./switch-branch.sh sean-dev1
```

After the build completes:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:9000 | Tuta Mail web application |
| Backend API | http://localhost:3000 | trusted-senders-backend (Supabase logging) |
| CORS Proxy | http://localhost:8080 | CORS-anywhere proxy for cross-origin requests |

---

## Architecture Overview

This fork extends Tuta Mail with three additional services for the MobyPhish anti-phishing study:

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Container                       │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  Frontend     │  │  CORS Proxy   │  │  Backend     │  │
│  │  (port 9000)  │  │  (port 8080)  │  │  (port 3000) │  │
│  │              │──│───────────────│──│──────────────│  │
│  │  Tuta Mail   │  │  Forwards to  │  │  Logs user   │  │
│  │  Web Client  │  │  app.tuta.com │  │  interactions │  │
│  │  + MobyPhish │  │  + backend    │  │  to Supabase  │  │
│  └──────────────┘  └───────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- **Frontend** — The built Tuta Mail web client with MobyPhish UI modifications
- **CORS Proxy** — Routes API requests from the browser to `app.tuta.com` and the backend, solving cross-origin issues
- **Trusted Senders Backend** — Node.js Express server that logs study interactions (known sender confirmations, phishing reports, etc.) to Supabase

---

## Study Branches

| Branch | Purpose | Anti-Phishing Banner | Phishing Reporting |
|--------|---------|---------------------|--------------------|
| `db-dev` | Active development — assignment tracking + `email_opened` logging | ✅ Full banner | Banner + dropdown |
| `sean-dev1` | **Experimental group** — full MobyPhish anti-phishing interface | ✅ Full banner | Banner + dropdown |
| `default-antiphishing-header` | Default Tuta Mail with upstream anti-phishing header | ✅ (upstream) | Dropdown only |
| `no-antiphishing-header` | **Control group** — no security header | ❌ None | Dropdown only |

### `sean-dev1` (Full Anti-Phishing Interface)

- Shows anti-phishing banner in mail view header
- Displays authentication status warnings
- Provides multiple interaction options: **Known Sender**, **Report Phishing**, **Learn More**, **Show Blocked Content**
- Full visual feedback for sender trust status

### `no-antiphishing-header` (Control Group — No Header)

- **No anti-phishing banner displayed**
- Clean mail interface without security warnings
- Phishing reporting still available via three-dots dropdown menu (⋮ → Report Email → Report Phishing)
- All reports logged to backend database as `reported_phishing`
- Same backend API functionality maintained

### Study Design Recommendation

| Group | Branch | Description |
|-------|--------|-------------|
| **Group A** (Experimental) | `sean-dev1` | Full anti-phishing interface with warning banners |
| **Group B** (Control) | `no-antiphishing-header` | No header warnings; dropdown reporting only |

Both groups have phishing reporting via the dropdown menu; Group A additionally sees the warning banner with authentication feedback.

---

## Branch Switching

### Method 1: Helper Script (Easiest)

```bash
# Switch to the no-header version (control group)
./switch-branch.sh no-antiphishing-header

# Switch back to full interface
./switch-branch.sh sean-dev1
```

The script will:
1. Stop any running containers
2. Build the application from the specified branch
3. Start all services
4. Display access URLs

### Method 2: Docker Compose with Environment Variable

```bash
# Stop current containers
docker-compose down

# Build with a specific branch
BUILD_BRANCH=no-antiphishing-header docker-compose up --build -d

# Or for the default branch
BUILD_BRANCH=sean-dev1 docker-compose up --build -d
```

### Method 3: Exported Environment Variable

```bash
export BUILD_BRANCH=no-antiphishing-header
docker-compose up --build
```

---

## Building the Web Client

You can build your own Tuta Mail client and run it locally. Remember that you have to update your Tuta Mail client on your own. If you prefer auto-updates, use the official [web client](https://app.tuta.com).

These instructions produce a **release** build. For a **debug** build, see the [Developing Tuta](#developing-tuta-hacking) section.

### Prerequisites

- An up-to-date version of **Git**
- **Node.js** (check `package.json` `engines` field for the version)
- **Emscripten** 3.1.59
- **WASM2JS** (included in binaryen; sometimes included with Emscripten)
- **Cargo & Rust** (1.80+)

### Build Steps

1. Clone the repository: `git clone https://github.com/tutao/tutanota.git`
2. Switch into the repository directory: `cd tutanota`
3. Checkout the latest web release tag: `git checkout tutanota-release-xxx`
4. Initialize liboqs and argon2 submodules: `git submodule init`
5. Synchronize submodules: `git submodule sync --recursive`
6. Update submodules: `git submodule update`
7. Install dependencies: `npm ci`
8. Build packages: `npm run build-packages`
9. Build the web part: `node webapp prod`
10. Switch into the build directory: `cd build`
11. Run a local server: `npx serve build -s -p 9000` or `python3 -m http.server 9000`
12. Open `localhost:9000` in your browser (tested: Firefox, Chrome/Chromium, Safari)

> **Note:** If you try building without initializing the submodules, you might encounter:
> ```
> Build error: Error: Could not load wasm-loader:liboqs.wasm …
> liboqs/src/kem/kem.c:12:10: fatal error: 'oqs/oqs.h' file not found
> ```
> Delete the `libs/webassembly/include` directory and re-build.

---

## Building with Backend Services (Manual)

If you don't want to use Docker, you can run the full MobyPhish stack manually.

### Additional Prerequisites

- All standard Tuta Mail prerequisites (see above)
- Supabase account and credentials for trusted-senders-backend

### Build Steps

1. Follow steps 1–8 from the [standard web client build](#build-steps) above
2. Build the web application for network access: `node make local`
3. Set up the trusted-senders-backend:
   ```bash
   cd trusted-senders-backend
   npm ci
   cp .env.example .env  # Then edit .env with your Supabase credentials
   ```
4. Set up the CORS proxy:
   ```bash
   cd cors-anywhere
   npm ci
   ```

### Running the Services

Start each service in a separate terminal:

```bash
# Terminal 1: CORS Proxy (required for Tuta API and backend access)
cd cors-anywhere
node server.js
# Listens on port 8080

# Terminal 2: Trusted Senders Backend
cd trusted-senders-backend
node index.js
# Listens on port 3000

# Terminal 3: Frontend
cd build
python3 -m http.server 9000
# Or: npx serve . -s -p 9000
```

### Trusted Senders Backend Configuration

Create `trusted-senders-backend/.env` with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### Network Access (Remote Browser)

When accessing from a remote browser (e.g., `http://10.252.16.42:9000`):

- Build with `node make local` (sets `staticUrl: null` for dynamic domain config resolution)
- Tuta API requests route through: `http://<host>:8080/https://app.tuta.com`
- Backend requests route through: `http://<host>:8080/http://localhost:3000`
- The CORS proxy handles cross-origin requests automatically

---

## Docker Setup In-Depth

### Dockerfiles

| File | Purpose |
|------|---------|
| `Dockerfile` | **Main all-in-one** — builds frontend, backend, and CORS proxy in a single container |
| `Dockerfile.frontend` | Frontend-only build (port 9000) |
| `Dockerfile.backend` | Backend-only build for trusted-senders-backend (port 3000) |
| `Dockerfile.cors` | CORS proxy only (port 8080) |

### Docker Compose Profiles

#### All-in-One (Default)

```bash
docker-compose up --build
```

Runs all three services in a single container.

#### Frontend Only

```bash
docker-compose --profile frontend-only up --build
```

Runs only the frontend service on port 9001 (to avoid conflict with the main service).

### Docker Compose Configuration

The `docker-compose.yml` uses the `BUILD_BRANCH` environment variable (defaults to `db-dev`):

```bash
# Examples
BUILD_BRANCH=sean-dev1 docker-compose up --build
BUILD_BRANCH=no-antiphishing-header docker-compose up --build
```

### Build Process

The Docker build follows the standard Tutanota build process:

1. Fetches the upstream release tag (`tutanota-release-301.250806.1`)
2. Initializes and updates submodules from the release
3. Switches to the specified branch
4. Preserves correct `buildSrc` files from the release
5. `npm ci --ignore-scripts` — clean install dependencies
6. `npm run build-packages` — build internal packages
7. `node make local` — build web application (uses `local` stage for network access support)

### Volumes

- `backend-data` — persistent storage for backend data at `/app/trusted-senders-backend/data`
- `./trusted-senders-backend/.env` — mounted from host for Supabase credentials

### Stopping & Rebuilding

```bash
# Stop services
docker-compose down

# Rebuild with cache
docker-compose up --build --force-recreate

# Full rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Domain Config System

The domain config system controls how the app resolves API URLs, WebAuthn endpoints, payment URLs, and other domain-specific parameters depending on which hostname the application is running on.

### How It Works

1. **At build time**, domain configs are defined in [`buildSrc/DomainConfigs.js`](buildSrc/DomainConfigs.js) and injected into the app as `env.domainConfigs` via [`buildSrc/env.js`](buildSrc/env.js).
2. **At runtime**, [`DomainConfigProvider`](src/common/api/common/DomainConfigProvider.ts) resolves the config for the current hostname using either the `staticUrl` (if set) or `location.href`.
3. If a static config exists for the hostname, it is used directly. Otherwise, the `{hostname}` template entry is used as a dynamic fallback, replacing `{hostname}` and `{protocol}` placeholders with the actual values.

### DomainConfig Properties

Each domain config entry is a `DomainConfig` object (defined in [`src/types.d.ts`](src/types.d.ts)) with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `firstPartyDomain` | `boolean` | Whether this is a well-known domain provided by Tuta |
| `partneredDomainTransitionUrl` | `string` | The other domain in the domain migration for the current staging level |
| `apiUrl` | `string` | URL used for REST API requests |
| `webauthnUrl` | `string` | URL for WebAuthn flow on desktop (current domain — `tuta.com`) |
| `legacyWebauthnUrl` | `string` | URL for WebAuthn flow on desktop (legacy domain — `tutanota.com`) |
| `webauthnMobileUrl` | `string` | Same as `webauthnUrl` but for mobile apps |
| `legacyWebauthnMobileUrl` | `string` | Same as `legacyWebauthnUrl` but for mobile apps |
| `paymentUrl` | `string` | URL for the credit card payment flow |
| `webauthnRpId` | `string` | Relying Party ID for registering WebAuthn keys |
| `u2fAppId` | `string` | URL for the legacy U2F API |
| `giftCardBaseUrl` | `string` | URL for building gift card sharing links |
| `referralBaseUrl` | `string` | URL for building referral links |
| `websiteBaseUrl` | `string` | Base URL for requesting information from the Tuta website |

### Configured Domains

The following domains are statically configured in `DomainConfigs.js`:

| Hostname | Environment | Notes |
|----------|-------------|-------|
| `app.tuta.com` | Production | Primary production domain |
| `mail.tutanota.com` | Production (legacy) | Legacy domain, transitions to `app.tuta.com` |
| `app.test.tuta.com` | Test / Staging | Test environment |
| `test.tutanota.com` | Test (legacy) | Legacy test domain |
| `app.local.tuta.com` | Local (HTTPS) | Local development with HTTPS on port 9000 |
| `app.local.tutanota.com` | Local (HTTPS, legacy) | Legacy local development domain |
| `localhost` | Local (HTTP) | Routes API through CORS proxy at port 8080 |
| `10.252.16.42` | Network access | Routes API through CORS proxy for LAN access |
| `{hostname}` | Dynamic fallback | Template that replaces `{hostname}` and `{protocol}` at runtime |

### Adding a New Domain Config

To add a new domain (e.g., for a new LAN IP or custom hostname):

1. Edit [`buildSrc/DomainConfigs.js`](buildSrc/DomainConfigs.js)
2. Add a new entry to the `domainConfigs` object:
   ```javascript
   "your.hostname.here": {
       firstPartyDomain: false,
       partneredDomainTransitionUrl: "http://your.hostname.here:9000",
       apiUrl: "http://your.hostname.here:8080/https://app.tuta.com",
       paymentUrl: "https://pay.tutanota.com/braintree.html",
       webauthnUrl: "http://your.hostname.here:9000/webauthn",
       legacyWebauthnUrl: "http://your.hostname.here:9000/webauthn",
       webauthnMobileUrl: "http://your.hostname.here:9000/webauthnmobile",
       legacyWebauthnMobileUrl: "http://your.hostname.here:9000/webauthnmobile",
       webauthnRpId: "your.hostname.here",
       u2fAppId: "http://your.hostname.here:9000/u2f-appid.json",
       giftCardBaseUrl: "https://app.tuta.com/giftcard",
       referralBaseUrl: "https://app.tuta.com/signup",
       websiteBaseUrl: "https://tuta.com",
   },
   ```
3. Rebuild the app (`node make local` or rebuild Docker)

### Dynamic Fallback (`{hostname}`)

If no static config matches the current hostname, the `{hostname}` template entry is used. The [`DomainConfigProvider`](src/common/api/common/DomainConfigProvider.ts) replaces `{hostname}` with the actual hostname (including port) and `{protocol}` with the actual protocol. This allows the app to work on arbitrary hostnames without needing a static entry.

> **Important:** The dynamic fallback routes API requests directly to the hostname itself (not through a CORS proxy). For custom deployments that need to proxy to `app.tuta.com`, you must add a static domain config entry that routes `apiUrl` through the CORS proxy.

### Build Stages and `staticUrl`

The `make.js` build script accepts a stage argument that affects domain config behavior:

| Stage | `staticUrl` | Behavior |
|-------|-------------|----------|
| `local` | `null` | Uses browser's `location.href` for domain resolution — **required for CORS proxy setups** |
| `prod` | `https://app.tuta.com` | Hardcodes API URL to production |
| `test` | `https://app.test.tuta.com` | Hardcodes API URL to test server |
| `host <url>` | Custom URL | Uses a custom host URL |

---

## Distribution / Deployment

### Pre-built Docker Images

Pre-built Docker image tarballs are available in the `dist/` directory. These contain the full stack (frontend + backend + CORS proxy) and can be loaded directly:

```bash
# Load a pre-built image
docker load -i dist/mobyphish-images-20260511-b295877b6a.tar.gz

# Then run with docker-compose
docker-compose up
```

Image naming convention: `mobyphish-images-YYYYMMDD-<commit-hash>.tar.gz`

### Exporting New Images

To create a new distributable image:

```bash
# Build the image
docker-compose build

# Save/export the image
docker save <image-name> | gzip > dist/mobyphish-images-$(date +%Y%m%d)-$(git rev-parse --short HEAD).tar.gz
```

---

## Developing Tuta (Hacking)

### Project Structure

| Path | Description |
|------|-------------|
| [`src/`](src/) | Common part and the desktop client code |
| [`app-android/`](app-android/) | Android specific parts |
| [`app-ios/`](app-ios/) | iOS specific parts |
| [`libs/`](libs/) | Vendored dependencies (non-minified and minified) |
| [`resources/`](resources/) | Resources (mostly images), most embedded in code |
| [`test/`](test/) | Test code |
| [`android.js`](android.js) | Script for building Android app |
| [`make.js`](make.js) | Script for building dev version |
| [`desktop.js`](desktop.js) | Script for building the release desktop client |
| [`webapp.js`](webapp.js) | Script for building release web application |
| [`trusted-senders-backend/`](trusted-senders-backend/) | MobyPhish backend API server |
| [`cors-anywhere/`](cors-anywhere/) | CORS proxy for cross-origin API access |

### Code Structure

Web part of the app is split in three parts: **client**, **worker**, and **common**. All code in `src/` except for the `api/` directory is intended for GUI and system interaction. Code in `api/` contains most of the logic for server communication, encryption, indexing, etc.

#### Glossary

| Term | Description |
|------|-------------|
| `SomethingView` | Big part of the app, corresponds to the URL (e.g., `mail`, `contact`, `settings`, `search`) |
| `SomethingListView` | Component which displays things in a list, usually in the second column |
| `SomethingViewer` | Component which usually displays one element (e.g., selected email or contact) |
| `SomethingModel` | Logic for some part of the app, lives in the main part |
| `SomethingController` | Bookkeeping or general action, not tied to a specific part |
| `SomethingFacade` | Logic for one domain, lives in the api part |
| `SomethingApp` | Communicates with native part to execute tasks in a domain |
| `Entity` | Object corresponding to a server database entity |
| `TypeModel` | Describes entity type |
| `TypeRef` | Small object to identify the entity and find `TypeModel` |

#### Communication

Worker, main thread & apps communicate through messages. Protocol is described in [RemoteMessageDispatcher](src/common/api/common/threading/MessageDispatcher.ts).
See [WorkerClient](src/common/api/main/WorkerClient.ts) and [WorkerImpl](src/common/api/worker/WorkerImpl.ts) for the client and server parts.

Native code communicates through [NativeInterface](src/common/native/common/NativeInterface.ts).

#### UI Code

UI code uses [Mithril](http://mithril.js.org/). It is a tiny framework which does routing & virtual DOM using a "hyperscript" language (`m(ComponentOrDomElement, {param: value}, [children])`).

```typescript
// Defining a Mithril component
import {Component} from "mithril"

type Attrs = { param1: string, paramTwo?: number }

class MyComponent implements Component<Attrs> {
    view(vnode: Vnode<Attrs>) {
        return m(".h1", "Hello " + vnode.attrs.param1)
    }
}

// Usage
m(MyComponent, {param1: "Mithril", param2: 1})
```

#### Network

For working with entities, use injected `EntityWorker` whenever possible. One level below lies `EntityRestInterface` (`EntityRestClient` or `EntityRestCache`).

For WebSocket updates in the worker, change [EventBus](src/common/api/worker/EventBusClient.ts). For the main thread, subscribe to [EventController](src/common/api/main/EventController.ts).

### Dev Build

```bash
# Build without specific target (uses browser URL as API endpoint)
node make

# Build against production server
node make prod

# Build desktop client against production
node make -d prod
```

Serve the `build` directory with any web server:

```bash
npx serve build -s -p 9000
```

### Chunking Rules

- Don't import things statically which you don't want bundled together
- `common-min` is api/common used by main and worker threads, needed at startup (marked by `@bundleInto`)
- `main` is the rest of the main thread code (not GUI related, no sanitizer/luxon dependency)
- `date` is luxon and everything that depends on it statically
- Anything can depend on `common-min`; anything can depend on `common` except `common-min` and `app.js`
- GUI-related things can depend on `gui-base`
- Don't depend on `settings`/`subscription`/`login`/`mail-view`/`mail-editor`/`calendar-view`/`contacts` statically
- Anything depending on luxon goes into `date` (imported dynamically)
- Native code is only imported from common code dynamically

Verify imports: `node webapp local`

---

## Building Android

> **Note:** Self-built Android apps will not receive automatic updates.

### Prerequisites

- All standard Tuta prerequisites
- Android SDK and NDK (28.2.13676358) — simplest via Android Studio

### Build Steps

1. Clone and set up the repo (steps 1–8 from [Building the Web Client](#build-steps))
2. Create a keystore (if you don't have one):
   ```bash
   keytool -genkey -noprompt -keystore MyKeystore.jks -alias tutaKey \
     -keyalg RSA -keysize 2048 -validity 10000 -deststoretype pkcs12 \
     -storepass CHANGEME -keypass CHANGEME -dname "CN=com.example"
   ```
3. Build the APK:
   ```bash
   APK_SIGN_ALIAS="tutaKey" APK_SIGN_STORE='MyKeystore.jks' \
     APK_SIGN_STORE_PASS="CHANGEME" APK_SIGN_KEY_PASS="CHANGEME" \
     node android
   ```
4. Install: `adb install -r <path-to-apk>`

For building the calendar app, run `node make prod -a calendar` instead.

---

## Building iOS

### Prerequisites

- XCode
- xcodegen
- (Optionally) swiftlint, swift-format — install via Homebrew

### Build Steps

1. Build the web part: `node make prod`
2. Generate iOS projects:
   ```bash
   pushd tuta-sdk/ios && xcodegen && popd
   mkdir -p build build-calendar-app
   cd app-ios
   xcodegen --spec calendar-project.yml
   xcodegen --spec mail-project.yml
   ```
3. Open `app-ios/tuta.xcworkspace` in XCode and build the mail app

For building the calendar app, run `node make prod -a calendar` instead.

---

## Building Desktop

> **Note:** Self-built desktop clients will not receive automatic updates.

### Prerequisites

- An up-to-date version of Git
- Node.js (check `package.json` `engines` field)

### Build Steps

1. Clone and set up the repo (steps 1–7 from [Building the Web Client](#build-steps))
2. Build packages: `npm run build-packages`
3. Build: `node desktop --custom-desktop-release`

The client for your platform will be in `build/desktop/`. Add `--unpacked` to skip packaging the installer.

#### Windows Note

The Windows client uses a native dependency for MAPI Support. Source at https://github.com/tutao/mapirs. Structure projects as:

```
parent dir
├── mapirs
└── tutanota-3
```

Otherwise, the builder loads the current release from https://github.com/tutao/mapirs/releases/latest.

---

## Testing

### Rust / SDK Tests

```bash
cargo test --all

# With local HTTP server tests:
cargo test --all --features test-with-local-http-server
```

### TypeScript Tests

```bash
# All tests
npm test

# Primary project tests only (no module tests)
npm run test:app

# Specific tests
npm run test:app -- -f 'CalendarModel'

# Without npm
node test -f CalendarModel

# In browser
npm run test:app -- -br

# Only in browser
npm run test:app -- --no-run -br

# Show all options
npm run test:app -- --help
```

---

## Trusted Sender Security

The MobyPhish trusted sender system validates senders by **email address** (not display name). Key security properties:

- **Email is the primary identifier**: Each `(user_email, trusted_email)` pair is unique
- **Name spoofing prevention**: Selecting an existing sender name from the dropdown validates the actual email address against known addresses for that sender
- **Case-insensitive matching**: Email comparisons are case-insensitive

For full security documentation, see [TRUSTED_SENDER_SECURITY.md](TRUSTED_SENDER_SECURITY.md).

### Backend Database Status Values

The backend tracks these status values in the `email_sender_status` table:

| Status | Description |
|--------|-------------|
| `confirmed` | User confirmed sender as known/trusted |
| `denied` | User denied/rejected sender |
| `reported_phishing` | User reported email as phishing |
| `reported_impersonation` | User reported email as impersonation |
| `trusted_once` | User clicked "Show Blocked Content" |
| `added_to_trusted` | Sender added to trusted list |
| `removed_from_trusted` | Sender removed from trusted list |

---

## Backend API Reference

All endpoints available at `http://localhost:3000`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/update-email-status` | Records phishing reports (status: `reported_phishing`) |
| `GET` | `/email-status/:user_email/:email_id` | Retrieves email status |
| `GET` | `/trusted-senders/:user_email` | Gets trusted senders list for a user |
| `POST` | `/add-trusted` | Adds sender to trusted list |
| `POST` | `/validate-sender-email` | Validates sender email against known sender names |

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :9000
# On Windows:
netstat -ano | findstr :9000

# Kill the process or change the port in docker-compose.yml
```

### Branch Not Found

```bash
git fetch origin
git branch -a | grep -E "sean-dev1|no-antiphishing-header"
```

### Build Fails

```bash
# Clean everything and start fresh
docker-compose down -v
docker system prune -a
./switch-branch.sh sean-dev1
```

### Submodule Errors

If you get `oqs/oqs.h file not found`:

1. Delete the `libs/webassembly/include` directory
2. Re-run the build

### Docker Tips

```bash
# View all service logs
docker-compose logs -f

# View only frontend logs
docker-compose logs -f tutanota

# Search for phishing reports in logs
docker-compose logs | grep "MOBYPHISH_LOG.*reported_phishing"

# Ensure prerequisites
./setup-repo.sh  # if available
```

---

## Translating

The Tuta apps are available in 40+ languages, translated by volunteers via [POEditor](https://poeditor.com).

To improve a language or start a new one, contact [hello@tutao.de](mailto:hello@tutao.de).

---

## License

See [LICENSE.txt](LICENSE.txt).
