# Cleanup Logic Removal and Build Process Fix

## The Problem

The setup script was trying to forcefully remove build artifacts, including `node_modules/electron/dist/resources/default_app.asar`, which caused permission errors:

```
rm: cannot remove 'node_modules/electron/dist/resources/default_app.asar': Permission denied
```

This was happening because electron files are often locked or have special permissions that prevent deletion.

## The Solution

**Removed the entire cleanup logic** and let the build commands handle overwrites naturally, as specified in `doc/BUILDING.md`.

### Changes Made:

1. **Removed `cleanup_builds()` function**
   - No more `rm -rf node_modules/` 
   - No more `rm -rf build/`
   - No more `rm -rf dist/`

2. **Removed interactive cleanup prompt**
   - No more "Do you want to clean up previous builds? (y/N)"
   - Script runs faster without user interaction

3. **Updated success message**
   - Now explains that build commands will handle overwrites
   - References the standard npm build process

4. **Applied version detection fix**
   - Now correctly detects `tutanota-release-296.250709.0`
   - Prioritizes 296.x > 3.x.x > others (excluding timestamps)

### New Build Process:

The script now relies on the standard build commands to handle overwrites:

1. **`npm ci`** - Clean install that removes node_modules and reinstalls
2. **`npm run build-packages`** - Builds packages, overwrites previous builds
3. **`node make prod`** - Builds web app, overwrites build directory

This is exactly what `doc/BUILDING.md` specifies and it's the recommended approach.

### Files Updated:

- ✅ `setup-repo.sh` - Removed cleanup logic, added version detection fix

### Benefits:

1. **No Permission Errors** - No more electron file deletion issues
2. **Faster Setup** - No interactive prompts or slow cleanup operations
3. **Standard Process** - Follows official building documentation
4. **Reliable Overwrites** - npm and build tools handle overwrites properly
5. **Correct Version** - Now uses tutanota-release-296.250709.0

### Expected Output:

```bash
[SUCCESS] Found latest release: tutanota-release-296.250709.0
[INFO] Checking out tutanota-release-296.250709.0...
...
[SUCCESS] Repository setup completed!
[SUCCESS] =================================================
[SUCCESS] You can now run Docker build:
[SUCCESS]   ./start-docker.sh
[SUCCESS]   or
[SUCCESS]   docker-compose up --build
[SUCCESS] 
[SUCCESS] The build process (npm ci, npm run build-packages, node make prod)
[SUCCESS] will automatically overwrite any previous builds.
```

Now the Docker build process should work smoothly without permission errors or cleanup issues! 🎉 