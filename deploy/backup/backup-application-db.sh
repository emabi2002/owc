#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command pg_dump
require_backup_set_dir
require_env PGHOST
require_env PGDATABASE
require_env PGUSER
require_env PGPASSWORD

export PGHOST PGDATABASE PGUSER PGPASSWORD
export PGPORT="${PGPORT:-5432}"

OUTPUT="$OWC_BACKUP_SET_DIR/application-db.dump"
TMP_OUTPUT="$OUTPUT.tmp"
rm -f "$TMP_OUTPUT"

pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$TMP_OUTPUT"

chmod 600 "$TMP_OUTPUT"
mv "$TMP_OUTPUT" "$OUTPUT"
echo "Application database backup created: $OUTPUT"
