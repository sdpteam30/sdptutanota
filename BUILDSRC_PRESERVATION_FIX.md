# buildSrc Preservation Fix

## The Problem

The original Docker build workflow had a potential issue where `buildSrc` files from the release could be overwritten when switching to the `dockerized` branch:

1. **Release checkout**: `git checkout tutanota-release-X.X.X` → Gets correct buildSrc files
2. **Submodules init**: Works correctly from release  
3. **Branch switch**: `git checkout dockerized` → **Could overwrite buildSrc files!**

If the `dockerized` branch already existed and had different `buildSrc` files, they would overwrite the ones from the release, potentially causing build failures.

## The Solution

We now **preserve and restore** the `buildSrc` files from the release:

### New Workflow Steps:

1. **Checkout release** → Gets release buildSrc files
2. **Initialize submodules** → From release
3. **Backup buildSrc** → `cp -r buildSrc buildSrc.release.backup`
4. **Switch to dockerized branch** → May overwrite buildSrc
5. **Compare and restore** → Restore release buildSrc if they differ

### Code Changes:

```bash
# Before switching branches
if [ -d "buildSrc" ]; then
    cp -r buildSrc buildSrc.release.backup
fi

# After switching branches
if [ -d "buildSrc.release.backup" ]; then
    if ! diff -rq buildSrc buildSrc.release.backup > /dev/null 2>&1; then
        echo "buildSrc files differ - restoring from release"
        rm -rf buildSrc
        mv buildSrc.release.backup buildSrc
    else
        echo "buildSrc files identical - no restoration needed"
        rm -rf buildSrc.release.backup
    fi
fi
```

## Files Updated:

- `setup-repo.sh` - Manual setup script
- `Dockerfile` - Main multi-service Docker build
- `Dockerfile.frontend` - Frontend-only Docker build

## Guarantee:

The `buildSrc` files used for building are **always** from the latest `tutanota-release-X.X.X` tag, ensuring consistent and reliable builds regardless of what's in the `dockerized` branch.

## Benefits:

1. **Consistent builds** - Always uses release buildSrc files
2. **No build failures** - Prevents buildSrc version mismatches
3. **Safe branch switching** - Dockerized branch can have other changes without affecting build files
4. **Verbose logging** - Clear indication of what's happening during the process 