#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command git
require_command sha256sum
require_command find
require_backup_set_dir

ENVIRONMENT="$(safe_environment_label)"
CREATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RELEASE_SHA="$(git -C "$OWC_REPO_ROOT" rev-parse HEAD)"
MANIFEST="$OWC_BACKUP_SET_DIR/backup-manifest.json"
CHECKSUMS="$OWC_BACKUP_SET_DIR/SHA256SUMS"

cat > "$MANIFEST" <<EOF
{
  "schemaVersion": 1,
  "environment": "$ENVIRONMENT",
  "createdAt": "$CREATED_AT",
  "releaseSha": "$RELEASE_SHA",
  "scope": "OWC repository-managed recovery artifacts",
  "containsSecrets": false,
  "cppsReplaySupported": false,
  "providerPitrVerified": false,
  "offHostCopyVerified": false,
  "restoreRehearsalVerified": false
}
EOF
chmod 600 "$MANIFEST"

(
  cd "$OWC_BACKUP_SET_DIR"
  find . -maxdepth 1 -type f ! -name 'SHA256SUMS' -printf '%P\n' \
    | LC_ALL=C sort \
    | while IFS= read -r file; do
        [[ -n "$file" ]] && sha256sum "$file"
      done > SHA256SUMS
)
chmod 600 "$CHECKSUMS"

echo "Backup finalized with backup-manifest.json and SHA256SUMS"
