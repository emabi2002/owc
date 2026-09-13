#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command tar
require_backup_set_dir
require_env OWC_EVIDENCE_EXPORT_DIR

if [[ ! -d "$OWC_EVIDENCE_EXPORT_DIR" ]]; then
  echo "Evidence export directory does not exist: $OWC_EVIDENCE_EXPORT_DIR" >&2
  exit 1
fi

OUTPUT="$OWC_BACKUP_SET_DIR/evidence-export.tar.gz"
TMP_OUTPUT="$OUTPUT.tmp"
rm -f "$TMP_OUTPUT"

tar -C "$OWC_EVIDENCE_EXPORT_DIR" -czf "$TMP_OUTPUT" .
chmod 600 "$TMP_OUTPUT"
mv "$TMP_OUTPUT" "$OUTPUT"

echo "Evidence export backup created from operator-provided path: $OUTPUT"
