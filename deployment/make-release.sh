#!/usr/bin/env bash
# make-release.sh — build all study arms and publish them as a GitHub release.
#
# Wraps build-all-arms.sh + `gh release create`. Attaches the image tarball
# and the laptop-side scripts as release assets so study laptops can download
# everything from one place.
#
# Usage:
#   ./deployment/make-release.sh                       # auto-generates tag: deploy-YYYYMMDD-<sha>
#   ./deployment/make-release.sh v1.0.0                # use specific tag
#   ./deployment/make-release.sh v1.0.0 "Pilot study"  # tag + title
#   DRAFT=1 ./deployment/make-release.sh               # create as draft (won't publish)
#
# Requirements:
#   - `gh` CLI installed and authenticated (gh auth login)
#   - Working tree committed (uncommitted changes → warning, not fatal)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# --- Preflight checks ---

if ! command -v gh >/dev/null 2>&1; then
	echo "Error: GitHub CLI (gh) not found. Install from https://cli.github.com/" >&2
	exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
	echo "Error: gh is not authenticated. Run: gh auth login" >&2
	exit 1
fi

if ! git diff-index --quiet HEAD --; then
	echo "Warning: working tree has uncommitted changes."
	echo "The release tarball will be built from committed code only."
	read -r -p "Continue? [y/N] " reply
	if [[ ! "$reply" =~ ^[Yy]$ ]]; then
		echo "Aborted."
		exit 1
	fi
fi

# --- Inputs ---

GIT_SHA="$(git rev-parse --short HEAD)"
DATE="$(date +%Y%m%d)"
BRANCH="$(git branch --show-current)"

TAG="${1:-deploy-${DATE}-${GIT_SHA}}"
TITLE="${2:-MobyPhish study deployment $DATE}"
DRAFT_FLAG=""
if [ "${DRAFT:-0}" = "1" ]; then
	DRAFT_FLAG="--draft"
fi

echo "=========================================="
echo "Release: $TAG"
echo "Title:   $TITLE"
echo "Branch:  $BRANCH"
echo "SHA:     $GIT_SHA"
echo "Draft:   ${DRAFT:-0}"
echo "=========================================="

# Confirm the tag doesn't already exist on the remote
if gh release view "$TAG" >/dev/null 2>&1; then
	echo "Error: release '$TAG' already exists on GitHub. Delete it first or pick a new tag." >&2
	exit 1
fi

# --- Build all arms ---

echo ""
echo "--- Step 1/3: Building all study arms ---"
echo ""
"$REPO_ROOT/deployment/build-all-arms.sh"

# Find the tarball that was just produced
TARBALL="$(ls -t "$REPO_ROOT/dist"/mobyphish-images-*.tar.gz 2>/dev/null | head -n1)"
if [ -z "$TARBALL" ] || [ ! -f "$TARBALL" ]; then
	echo "Error: no tarball found in dist/ after build." >&2
	exit 1
fi
echo ""
echo "Tarball: $TARBALL"
echo "Size:    $(du -h "$TARBALL" | cut -f1)"

# --- Compose release notes ---

NOTES_FILE="$(mktemp)"
trap 'rm -f "$NOTES_FILE"' EXIT

cat > "$NOTES_FILE" <<EOF
## MobyPhish study deployment

**Built from:** \`$BRANCH\` @ \`$GIT_SHA\`
**Date:** $DATE

### Included study arms
- \`sean-dev1\` — full MobyPhish anti-phishing UI
- \`db-dev\` — assignment tracking + email_opened logging
- \`default-antiphishing-header\` — upstream Tuta anti-phishing header
- \`no-antiphishing-header\` — control group, no header

### Laptop setup
1. Download \`$(basename "$TARBALL")\`, \`docker-compose.laptop.yml\`, and \`run-study.sh\` from this release.
2. Place them in the same directory, alongside a \`.env\` file containing your Supabase credentials.
3. Load images: \`gunzip -c $(basename "$TARBALL") | docker load\`
4. Run an arm: \`./run-study.sh <arm-name>\`

### Services
- Frontend: http://localhost:9000
- Backend:  http://localhost:3000
- CORS:     http://localhost:8080
EOF

# --- Create the release ---

echo ""
echo "--- Step 2/3: Creating GitHub release ---"
echo ""
gh release create "$TAG" \
	--title "$TITLE" \
	--notes-file "$NOTES_FILE" \
	--target "$GIT_SHA" \
	$DRAFT_FLAG

# --- Upload assets ---

echo ""
echo "--- Step 3/3: Uploading assets ---"
echo ""
gh release upload "$TAG" \
	"$TARBALL" \
	"$REPO_ROOT/deployment/docker-compose.laptop.yml" \
	"$REPO_ROOT/deployment/run-study.sh"

echo ""
echo "=========================================="
echo "✓ Release published: $TAG"
echo "=========================================="
gh release view "$TAG"
