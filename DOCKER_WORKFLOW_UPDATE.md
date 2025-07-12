# Docker Workflow Update

## New Automated Workflow

The setup script and Dockerfiles have been updated to follow a specific workflow for consistent builds:

## Workflow Steps

### 1. Repository Validation
- Ensures you're in the correct repository (sdpteam30/sdptutanota)
- Sets up upstream remote if not already configured

### 2. Fetch All Branches and Tags
```bash
git fetch upstream --all --tags
git fetch origin --all --tags
```

### 3. Find Latest Release
- Searches for the most current `tutanota-release-x.x.x` tag
- Uses version sorting to find the latest release
- Falls back to remote tag lookup if local tags aren't available

### 4. Checkout Latest Release
```bash
git checkout tutanota-release-x.x.x  # latest version found
```

### 5. Initialize Submodules from Release
```bash
git submodule init
git submodule sync --recursive
git submodule update
```

### 6. Switch to 'dockerized' Branch
- If 'dockerized' branch exists locally: switches to it
- If 'dockerized' branch exists on remote: checks out from remote
- If 'dockerized' branch doesn't exist: creates new branch from current state

## Benefits of This Workflow

### Consistent Base
- Always starts from the latest stable Tutanota release
- Ensures all builds have the same foundation
- Properly initializes submodules from the release

### Development Branch Isolation
- Work happens on 'dockerized' branch
- Keeps development changes separate from release base
- Easy to merge or rebase changes

### Automated Discovery
- No need to manually specify release versions
- Always uses the most current release automatically
- Handles both local and remote tag scenarios

## Script Usage

### Interactive Setup
```bash
./setup-repo.sh
```

### Docker Build (includes setup)
```bash
./start-docker.sh
```

### Manual Setup
```bash
# The script automates this workflow:
git fetch upstream --all --tags
LATEST_RELEASE=$(git tag -l "tutanota-release-*" | sort -V | tail -n 1)
git checkout "$LATEST_RELEASE"
git submodule init && git submodule sync --recursive && git submodule update
git checkout -b dockerized  # or switch to existing
```

## Docker Build Integration

The Dockerfiles now follow the same workflow:
1. Set up git configuration
2. Add upstream remote and fetch all tags
3. Find and checkout latest tutanota-release
4. Initialize submodules from the release
5. Switch to 'dockerized' branch
6. Continue with npm install and build process

## Expected Output

When running the setup, you should see:
```
[INFO] Finding latest tutanota-release version...
[SUCCESS] Found latest release: tutanota-release-3.x.x
[INFO] Checking out tutanota-release-3.x.x...
[SUCCESS] Successfully checked out tutanota-release-3.x.x
[INFO] Initializing and updating submodules from release...
[SUCCESS] Submodules updated successfully from release
[INFO] Switching to 'dockerized' branch...
[SUCCESS] Created new 'dockerized' branch from tutanota-release-3.x.x
[INFO] Current branch: dockerized
[INFO] Based on release: tutanota-release-3.x.x
```

This ensures your Docker builds are always based on the latest stable release with properly configured submodules, while keeping your development work on a separate branch. 