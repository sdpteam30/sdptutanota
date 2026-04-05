#!/usr/bin/env bash
# run-study.sh — laptop-side launcher. Starts the container for a given
# study arm using a pre-loaded Docker image. No builds, no git, no network.
#
# Usage:
#   ./run-study.sh                # defaults to sean-dev1
#   ./run-study.sh db-dev
#   ./run-study.sh no-antiphishing-header
#
# Stop with:
#   docker compose -f docker-compose.laptop.yml down

set -euo pipefail

ARM="${1:-sean-dev1}"
VALID_ARMS=(sean-dev1 db-dev default-antiphishing-header no-antiphishing-header)

# Validate arm name
valid=0
for a in "${VALID_ARMS[@]}"; do
	if [ "$a" = "$ARM" ]; then valid=1; break; fi
done
if [ "$valid" = 0 ]; then
	echo "Error: unknown study arm '$ARM'" >&2
	echo "Valid arms: ${VALID_ARMS[*]}" >&2
	exit 1
fi

# Check image is loaded
if ! docker image inspect "mobyphish:$ARM" >/dev/null 2>&1; then
	echo "Error: image 'mobyphish:$ARM' not found locally." >&2
	echo "" >&2
	echo "Load the image bundle first:" >&2
	echo "  gunzip -c mobyphish-images-*.tar.gz | docker load" >&2
	exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.laptop.yml"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
	echo "Error: $ENV_FILE not found." >&2
	echo "Copy your Supabase credentials .env file into the deployment/ directory first." >&2
	exit 1
fi

# Stop any previous arm before starting the new one
STUDY_ARM="$ARM" docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true

echo "Starting MobyPhish study arm: $ARM"
STUDY_ARM="$ARM" docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "✓ Services running:"
echo "    Frontend:   http://localhost:9000"
echo "    Backend:    http://localhost:3000"
echo "    CORS proxy: http://localhost:8080"
echo ""
echo "Study arm: $ARM"
echo "Logs:  docker compose -f $COMPOSE_FILE logs -f"
echo "Stop:  docker compose -f $COMPOSE_FILE down"
