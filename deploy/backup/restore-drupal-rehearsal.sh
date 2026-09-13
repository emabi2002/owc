#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command docker
require_nonproduction_rehearsal
require_backup_set_dir
require_env OWC_DR_DRUPAL_COMPOSE_PROJECT

if [[ "$OWC_DR_DRUPAL_COMPOSE_PROJECT" != *dr-rehearsal* ]]; then
  echo "OWC_DR_DRUPAL_COMPOSE_PROJECT must contain dr-rehearsal" >&2
  exit 1
fi

"$SCRIPT_DIR/verify-backup.sh"

COMPOSE_FILE="${OWC_DRUPAL_COMPOSE_FILE:-$OWC_REPO_ROOT/drupal/docker-compose.yml}"
DRUPAL_DB_USER="${DRUPAL_DB_USER:-owc_drupal}"
DRUPAL_DB_NAME="${DRUPAL_DB_NAME:-owc_drupal}"
DB_DUMP="$OWC_BACKUP_SET_DIR/drupal-db.dump"
MEDIA_ARCHIVE="$OWC_BACKUP_SET_DIR/drupal-media.tar.gz"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Drupal compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi
if [[ ! -s "$DB_DUMP" || ! -s "$MEDIA_ARCHIVE" ]]; then
  echo "Drupal backup artifacts are incomplete" >&2
  exit 1
fi

cat "$DB_DUMP" | docker compose -f "$COMPOSE_FILE" -p "$OWC_DR_DRUPAL_COMPOSE_PROJECT" exec -T postgres \
  pg_restore -U "$DRUPAL_DB_USER" -d "$DRUPAL_DB_NAME" --clean --if-exists --no-owner --no-privileges

cat "$MEDIA_ARCHIVE" | docker compose -f "$COMPOSE_FILE" -p "$OWC_DR_DRUPAL_COMPOSE_PROJECT" exec -T drupal \
  sh -c 'mkdir -p /opt/drupal/web/sites/default/files && find /opt/drupal/web/sites/default/files -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar -xzf - -C /opt/drupal/web/sites/default/files'

echo "Drupal restore rehearsal completed in isolated compose project: $OWC_DR_DRUPAL_COMPOSE_PROJECT"
