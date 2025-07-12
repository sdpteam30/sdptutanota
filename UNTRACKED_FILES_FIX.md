# Untracked Files and buildSrc Conflict Fix

## The Problem

Several issues were preventing the repository setup from working properly:

1. **Untracked files blocking checkout:**
   ```
   error: The following untracked working tree files would be overwritten by checkout:
   	buildSrc/BuildCache.js
   	buildSrc/Builder.js
   	buildSrc/SystemConfig.js
   ```

2. **Stash restoration undoing buildSrc fixes:**
   - The buildSrc files were correctly restored from the release
   - But then the stash restoration was undoing those changes
   - This caused missing critical files like `buildSrc/postinstall.js`

3. **Submodule warnings:**
   ```
   fatal: no submodule mapping found in .gitmodules for path 'libs/Signal-FTS5-Extension'
   ```

## The Solution

### 1. Untracked Files Handling

**Before checkout:**
- Detect all untracked files with `git ls-files --others --exclude-standard`
- Move them to `.git/untracked-backup/` temporarily
- This allows clean checkout without conflicts

**After setup:**
- Restore untracked files that don't conflict with buildSrc
- Skip buildSrc files to preserve release versions

### 2. Selective Stash Restoration

**Problem:** `git stash pop` was restoring ALL stashed changes, including buildSrc files.

**Solution:** 
- Create a patch from the stash: `git stash show -p > .git/stash-patch.tmp`
- Apply it selectively: `git apply --exclude="buildSrc/*"`
- This preserves your Docker setup changes while keeping release buildSrc files

### 3. Improved Workflow

```bash
# 1. Handle untracked files
git ls-files --others --exclude-standard | while read file; do
    mv "$file" ".git/untracked-backup/$file"
done

# 2. Stash tracked changes
git stash push -m "Auto-stash before checkout..."

# 3. Checkout release (now safe)
git checkout tutanota-release-X.X.X

# 4. Preserve buildSrc from release
cp -r buildSrc buildSrc.release.backup

# 5. Switch to dockerized branch
git checkout dockerized

# 6. Restore release buildSrc files
if buildSrc differs: restore from backup

# 7. Restore non-buildSrc changes
git apply --exclude="buildSrc/*" stash-patch.tmp

# 8. Restore non-buildSrc untracked files
restore files from .git/untracked-backup/ except buildSrc/*
```

## Files Updated:

- `setup-repo.sh` - Manual setup script
- `Dockerfile` - Main multi-service Docker build
- `Dockerfile.frontend` - Frontend-only Docker build
- `.gitignore` - Added `.git/untracked-backup/`

## Key Benefits:

1. **No more checkout conflicts** - Untracked files are safely moved
2. **buildSrc integrity preserved** - Always uses release versions
3. **Selective restoration** - Your Docker changes are preserved
4. **Robust error handling** - Graceful fallbacks if restoration fails
5. **Clean workspace** - Temporary files are cleaned up

## What Gets Preserved vs Restored:

### Always Preserved (from release):
- `buildSrc/postinstall.js`
- `buildSrc/buildPackages.js`
- `buildSrc/buildUtils.js`
- All other buildSrc files needed for building

### Restored from your changes:
- `setup-repo.sh`
- `start-docker.sh`
- `docker-compose.yml`
- `Dockerfile*`
- Any other Docker-related files

### Skipped (not restored):
- `buildSrc/BuildCache.js` (untracked)
- `buildSrc/Builder.js` (untracked)
- `buildSrc/SystemConfig.js` (untracked)
- Any other buildSrc files that might conflict

## Result:

Your Docker setup files are preserved while ensuring the build system has the correct buildSrc files from the release. This guarantees successful builds while maintaining your Docker environment customizations. 