#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command pg_restore
require_nonproduction_rehearsal
require_backup_set_dir
require_env PGHOST
require_env PGUSER
require_env PGPASSWORD
require_env OWC_DR_TARGET_DATABASE

if [[ ! "$OWC_DR_TARGET_DATABASE" =~ _dr_rehearsal$ ]]; then
  echo "OWC_DR_TARGET_DATABASE must end with _dr_rehearsal" >&2
  exit 1
fi

"$SCRIPT_DIR/verify-backup.sh"

DUMP="$OWC_BACKUP_SET_DIR/application-db.dump"
if [[ ! -s "$DUMP" ]]; then
  echo "Application database backup is missing: $DUMP" >&2
  exit 1
fi

export PGHOST PGUSER PGPASSWORD
export PGPORT="${PGPORT:-5432}"

pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$OWC_DR_TARGET_DATABASE" \
  "$DUMP"

echo "Application database restore rehearsal completed for $OWC_DR_TARGET_DATABASE"
