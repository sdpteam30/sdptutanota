# Stash Workflow Fix

## The Problem

When running the repository setup script, users encountered this error:

```
error: Your local changes to the following files would be overwritten by checkout:
	setup-repo.sh
	start-docker.sh
Please commit your changes or stash them before you switch branches.
Aborting
```

This happened because the script tries to checkout a release tag, but local changes to Docker setup files would be overwritten.

## The Solution

The setup script now **automatically stashes and restores** local changes during the repository setup process.

### New Workflow Steps:

1. **Check for local changes** → Check working directory and staging area
2. **Auto-stash if needed** → `git stash push -m "Auto-stash before checkout..."`
3. **Checkout release** → Safe to checkout without conflicts
4. **Initialize submodules** → From release
5. **Switch to dockerized branch** → Safe branch switching
6. **Restore stashed changes** → `git stash pop` to restore your changes

### Code Changes:

```bash
# Before checkout
if ! git diff --quiet || ! git diff --cached --quiet; then
    git stash push -m "Auto-stash before checkout $latest_release ($(date))"
    stash_created=true
    print_success "Local changes stashed"
fi

# After dockerized branch setup
if [ "$stash_created" = true ]; then
    print_status "Restoring stashed changes..."
    if git stash pop; then
        print_success "Local changes restored"
    else
        print_warning "Failed to restore stashed changes automatically"
        print_warning "Your changes are still in the stash - use 'git stash pop' to restore them manually"
    fi
fi
```

## Files Updated:

- `setup-repo.sh` - Manual setup script
- `Dockerfile` - Main multi-service Docker build
- `Dockerfile.frontend` - Frontend-only Docker build

## Benefits:

1. **No more checkout conflicts** - Local changes are safely stashed
2. **Automatic restoration** - Your changes are restored after setup
3. **Timestamped stashes** - Easy to identify auto-created stashes
4. **Graceful error handling** - If restoration fails, changes remain in stash
5. **Non-destructive** - Your work is never lost

## Manual Recovery:

If the automatic stash restoration fails for any reason:

```bash
# List stashes to find your changes
git stash list

# Restore manually
git stash pop

# Or apply specific stash
git stash apply stash@{0}
```

## Stash Message Format:

Auto-created stashes use this format:
```
Auto-stash before checkout tutanota-release-1536579556293 (Mon Dec 11 10:30:45 2023)
```

This makes it easy to identify and manage auto-created stashes vs. manual ones. 