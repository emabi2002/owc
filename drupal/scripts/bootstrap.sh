#!/usr/bin/env bash
set -euo pipefail

cd /opt/drupal

DB_URL="pgsql://${DRUPAL_DB_USER}:${DRUPAL_DB_PASSWORD}@${DRUPAL_DB_HOST}:${DRUPAL_DB_PORT}/${DRUPAL_DB_NAME}"

if ! vendor/bin/drush status --field=bootstrap 2>/dev/null | grep -q Successful; then
  vendor/bin/drush site:install standard \
    --db-url="${DB_URL}" \
    --site-name="${DRUPAL_SITE_NAME}" \
    --account-name="${DRUPAL_ADMIN_USER}" \
    --account-pass="${DRUPAL_ADMIN_PASSWORD}" \
    --account-mail="${DRUPAL_ADMIN_EMAIL}" \
    -y
fi

# OWC Drupal configuration baseline.
# The committed configuration is mounted read-only at /opt/drupal/config/sync.
# Point Drupal at this directory so exports/status/imports use the
# version-controlled enterprise CMS configuration.
SETTINGS="/opt/drupal/web/sites/default/settings.php"
CONFIG_SYNC="/opt/drupal/config/sync"

if [ -d "$CONFIG_SYNC" ]; then
  if grep -q "^\\$settings\['config_sync_directory'\]" "$SETTINGS"; then
    sed -i "s#^\\$settings\['config_sync_directory'\].*#\\$settings['config_sync_directory'] = '$CONFIG_SYNC';#" "$SETTINGS"
  else
    printf "\n\\$settings['config_sync_directory'] = '%s';\n" "$CONFIG_SYNC" >> "$SETTINGS"
  fi
fi

vendor/bin/drush en jsonapi serialization workflows content_moderation media media_library file image options -y
vendor/bin/drush php:script /opt/owc-drupal/scripts/provision.php
vendor/bin/drush cr

echo "OWC Drupal bootstrap completed."
