#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command sha256sum
require_backup_set_dir

MANIFEST="$OWC_BACKUP_SET_DIR/backup-manifest.json"
CHECKSUMS="$OWC_BACKUP_SET_DIR/SHA256SUMS"

if [[ ! -s "$MANIFEST" ]]; then
  echo "Required backup-manifest.json is missing or empty" >&2
  exit 1
fi
if [[ ! -s "$CHECKSUMS" ]]; then
  echo "Required SHA256SUMS is missing or empty" >&2
  exit 1
fi

(
  cd "$OWC_BACKUP_SET_DIR"
  sha256sum -c SHA256SUMS
)

grep -q '"containsSecrets": false' "$MANIFEST"
grep -q '"cppsReplaySupported": false' "$MANIFEST"

echo "Backup checksum and manifest verification succeeded"
