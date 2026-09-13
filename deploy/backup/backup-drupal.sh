#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_command docker
require_backup_set_dir

COMPOSE_FILE="${OWC_DRUPAL_COMPOSE_FILE:-$OWC_REPO_ROOT/drupal/docker-compose.yml}"
COMPOSE_PROJECT="${OWC_DRUPAL_COMPOSE_PROJECT:-owc-drupal}"
DRUPAL_DB_USER="${DRUPAL_DB_USER:-owc_drupal}"
DRUPAL_DB_NAME="${DRUPAL_DB_NAME:-owc_drupal}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Drupal compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

DB_OUTPUT="$OWC_BACKUP_SET_DIR/drupal-db.dump"
MEDIA_OUTPUT="$OWC_BACKUP_SET_DIR/drupal-media.tar.gz"
DB_TMP="$DB_OUTPUT.tmp"
MEDIA_TMP="$MEDIA_OUTPUT.tmp"
rm -f "$DB_TMP" "$MEDIA_TMP"

docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" exec -T postgres \
  pg_dump -U "$DRUPAL_DB_USER" -d "$DRUPAL_DB_NAME" -Fc > "$DB_TMP"

docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" exec -T drupal \
  tar -C /opt/drupal/web/sites/default/files -czf - . > "$MEDIA_TMP"

chmod 600 "$DB_TMP" "$MEDIA_TMP"
mv "$DB_TMP" "$DB_OUTPUT"
mv "$MEDIA_TMP" "$MEDIA_OUTPUT"

echo "Drupal database backup created: $DB_OUTPUT"
echo "Drupal public media backup created: $MEDIA_OUTPUT"
