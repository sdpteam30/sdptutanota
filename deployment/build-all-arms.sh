#!/usr/bin/env bash
# build-all-arms.sh — builds all MobyPhish study arms and saves them as a
# single distributable tarball. Run on a dev machine; ship the output to
# study laptops along with docker-compose.laptop.yml and run-study.sh.
#
# Usage:
#   ./deployment/build-all-arms.sh
#   OUT_DIR=/tmp ./deployment/build-all-arms.sh
#   ARMS="sean-dev1 db-dev" ./deployment/build-all-arms.sh   # subset

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ARMS="${ARMS:-sean-dev1 db-dev default-antiphishing-header no-antiphishing-header}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/dist}"
GIT_SHA="$(git rev-parse --short HEAD)"
DATE="$(date +%Y%m%d)"
TARBALL="$OUT_DIR/mobyphish-images-${DATE}-${GIT_SHA}.tar.gz"

mkdir -p "$OUT_DIR"

# docker-compose default image name is <project>-<service>.
# The project name is derived from the directory name, so detect it.
PROJECT_NAME="$(basename "$REPO_ROOT" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]_-')"
SRC_TAG="${PROJECT_NAME}-tutanota:latest"

images=()

for arm in $ARMS; do
	echo "=========================================="
	echo "Building arm: $arm"
	echo "=========================================="
	BUILD_BRANCH="$arm" docker compose build tutanota

	dst_tag="mobyphish:${arm}"
	docker tag "$SRC_TAG" "$dst_tag"
	images+=("$dst_tag")
done

echo "=========================================="
echo "Saving ${#images[@]} image(s) to $TARBALL"
echo "=========================================="
docker save "${images[@]}" | gzip > "$TARBALL"

size="$(du -h "$TARBALL" | cut -f1)"
echo ""
echo "✓ Done. Tarball: $TARBALL ($size)"
echo ""
echo "To distribute, ship these four things to each study laptop:"
echo "  1. $TARBALL"
echo "  2. deployment/docker-compose.laptop.yml"
echo "  3. deployment/run-study.sh"
echo "  4. .env  (Supabase creds, copied into deployment/ directory — NOT in git)"
echo ""
echo "Laptop-side load:"
echo "  gunzip -c $(basename "$TARBALL") | docker load"
echo "  ./run-study.sh <arm-name>"
