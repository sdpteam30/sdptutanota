# Branch Switching Guide for MobyPhish Study

This guide explains how to switch between the two study branches for your phishing research.

## Two Study Branches

### 1. `sean-dev1` (Full Anti-Phishing Interface)
- **Features:**
  - Shows anti-phishing banner in mail view header
  - Displays authentication status warnings
  - Provides multiple interaction options in banner:
    - "Known Sender" button
    - "Report Phishing" button
    - "Learn More" button
    - "Show Blocked Content" button (when applicable)
  - Full visual feedback for sender trust status

### 2. `no-antiphishing-header` (Control Group - No Header)
- **Features:**
  - **NO anti-phishing banner displayed**
  - Clean mail interface without security warnings
  - Phishing reporting still available via three-dots dropdown menu (⋮)
  - All reports logged to backend database as `reported_phishing`
  - Same backend API functionality maintained

## How to Switch Branches

### Method 1: Using the Helper Script (Easiest)

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

### Method 2: Manual Docker Compose

```bash
# Stop current containers
docker-compose down

# Build with no-header branch
BUILD_BRANCH=no-antiphishing-header docker-compose up --build -d

# Or build with full interface branch
BUILD_BRANCH=sean-dev1 docker-compose up --build -d
```

### Method 3: Using Docker Compose with Environment Variable

```bash
# Set environment variable and build
export BUILD_BRANCH=no-antiphishing-header
docker-compose up --build

# Or in one line
BUILD_BRANCH=no-antiphishing-header docker-compose up --build
```

## Accessing the Application

After building either branch:
- **Frontend:** http://localhost:9000
- **Backend API:** http://localhost:3000
- **CORS Proxy:** http://localhost:8080

## Phishing Reporting in Both Branches

### In `sean-dev1` (Full Interface)
Users can report phishing through:
1. **Banner button:** "Report Phishing" button directly in the anti-phishing header
2. **Three-dots menu:** ⋮ → "Report Email" → "Report Phishing"

### In `no-antiphishing-header` (No Header)
Users can report phishing through:
1. **Three-dots menu ONLY:** ⋮ → "Report Email" → "Report Phishing"

**Both methods log to the backend database with status `reported_phishing`**

## Backend Database Status Values

The backend tracks the following status values in the `email_sender_status` table:
- `confirmed` - User confirmed sender as known/trusted
- `denied` - User denied/rejected sender
- `reported_phishing` - User reported email as phishing
- `reported_impersonation` - User reported email as impersonation
- `trusted_once` - User clicked "Show Blocked Content"
- `added_to_trusted` - Sender added to trusted list
- `removed_from_trusted` - Sender removed from trusted list

## Viewing Logs

```bash
# View all service logs
docker-compose logs -f

# View only frontend logs
docker-compose logs -f tutanota

# Search for phishing reports in logs
docker-compose logs | grep "MOBYPHISH_LOG.*reported_phishing"
```

## Stopping Services

```bash
docker-compose down
```

## Rebuilding Without Cache

If you need to force a complete rebuild:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Troubleshooting

### Port Already in Use
If ports 3000, 8080, or 9000 are already in use:
```bash
# Find what's using the port
lsof -i :9000
# or on Windows
netstat -ano | findstr :9000

# Kill the process or change the port in docker-compose.yml
```

### Branch Not Found
If you get "branch not found" errors:
```bash
# Fetch latest branches
git fetch origin

# Verify branches exist
git branch -a | grep -E "sean-dev1|no-antiphishing-header"
```

### Build Fails
```bash
# Clean everything and start fresh
docker-compose down -v
docker system prune -a
./switch-branch.sh sean-dev1
```

## Study Design Recommendation

For a controlled study:
1. **Group A (Experimental):** Use `sean-dev1` - Full anti-phishing interface
2. **Group B (Control):** Use `no-antiphishing-header` - No header warnings

Both groups have the same phishing reporting functionality available through the dropdown menu, but Group A additionally sees the warning banner with authentication feedback.

## Backend API Endpoints Used

- `POST /update-email-status` - Records phishing reports with `status: "reported_phishing"`
- `GET /email-status/:user_email/:email_id` - Retrieves email status
- `GET /trusted-senders/:user_email` - Gets trusted senders list
- `POST /add-trusted` - Adds sender to trusted list

All endpoints are available on http://localhost:3000

