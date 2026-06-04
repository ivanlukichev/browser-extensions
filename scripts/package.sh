#!/usr/bin/env bash
# Build store-ready zips for an extension. Each zip has manifest.json at the
# archive root (required by all stores) and excludes dotfiles / dir entries.
#
# Usage: scripts/package.sh <extension-folder> [store ...]
#   scripts/package.sh noisemeter            # all stores
#   scripts/package.sh noisemeter firefox    # one store
set -euo pipefail

ext="${1:?usage: scripts/package.sh <extension-folder> [store ...]}"
shift || true
root="$(cd "$(dirname "$0")/.." && pwd)"
ext_dir="$root/$ext"
[ -d "$ext_dir" ] || { echo "no such extension: $ext_dir" >&2; exit 1; }

stores=("$@")
[ ${#stores[@]} -eq 0 ] && stores=(chromium edge firefox opera)

out="$root/dist/$ext"
mkdir -p "$out"

for store in "${stores[@]}"; do
  src="$ext_dir/$store"
  [ -d "$src" ] || { echo "skip $store (no folder)"; continue; }
  zip_path="$out/$ext-$store.zip"
  rm -f "$zip_path"
  # explicit file list → no bare directory entries, manifest at root
  ( cd "$src" && find . -type f ! -name '.*' | sed 's|^\./||' | zip -X -q "$zip_path" -@ )
  # sanity: manifest.json must be at the archive root
  root_manifest="$(unzip -Z1 "$zip_path" | grep -xE 'manifest\.json' || true)"
  if [ "$root_manifest" = "manifest.json" ]; then
    echo "built  $zip_path"
  else
    echo "ERROR  $zip_path has no root manifest.json" >&2; exit 1
  fi
done
