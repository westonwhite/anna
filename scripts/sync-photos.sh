#!/bin/sh
# Wrapper: ./scripts/sync-photos.sh <google-photos-album-url> [--prune]
exec python3 "$(dirname "$0")/sync-photos.py" "$@"
