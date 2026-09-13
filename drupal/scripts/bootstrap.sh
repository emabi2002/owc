#!/usr/bin/env bash
set -euo pipefail

cd /opt/drupal

DB_URL="pgsql://${DRUPAL_DB_USER}:${DRUPAL_DB_PASSWORD}@${DRUPAL_DB_HOST}:${DRUPAL_DB_PORT}/${DRUPAL_DB_NAME}"
SETTINGS="/opt/drupal/web/sites/default/settings.php"
DEFAULT_SETTINGS="/opt/drupal/web/sites/default/default.settings.php"
CONFIG_SYNC="/opt/drupal/config/sync"

echo "OWC Drupal bootstrap starting..."

# settings.php lives on the persistent Drupal sites volume. Ensure it exists
# before site installation so Drupal can resolve the committed sync directory.
if [ ! -f "$SETTINGS" ]; then
  cp "$DEFAULT_SETTINGS" "$SETTINGS"
fi

# Update Drupal's PHP settings without asking Bash to interpret the PHP
# $settings variable. A quoted heredoc keeps all PHP variables literal.
php <<'PHP'
<?php
$file = '/opt/drupal/web/sites/default/settings.php';
$sync = '/opt/drupal/config/sync';
$text = file_get_contents($file);
$line = '$settings[\'config_sync_directory\'] = \'' . $sync . '\';';
$pattern = '/^[[:space:]]*\\$settings\\[\'config_sync_directory\'\\].*$/m';

if (preg_match($pattern, $text)) {
    $text = preg_replace($pattern, $line, $text, 1);
} else {
    $text .= PHP_EOL . $line . PHP_EOL;
}

if (file_put_contents($file, $text) === false) {
    fwrite(STDERR, "Unable to update Drupal config_sync_directory.\n");
    exit(1);
}
PHP

# A fresh environment is reconstructed directly from the version-controlled
# Drupal configuration baseline. provision.php remains available only as a
# development/recovery utility and is not part of normal bootstrap.
if ! vendor/bin/drush status --field=bootstrap 2>/dev/null | grep -q Successful; then
  if [ ! -f "$CONFIG_SYNC/core.extension.yml" ]; then
    echo "ERROR: OWC configuration baseline unavailable: $CONFIG_SYNC/core.extension.yml" >&2
    exit 1
  fi

  echo "Installing OWC Drupal from committed configuration..."
  vendor/bin/drush site:install \
    --existing-config \
    --db-url="$DB_URL" \
    --account-name="${DRUPAL_ADMIN_USER}" \
    --account-pass="${DRUPAL_ADMIN_PASSWORD}" \
    --account-mail="${DRUPAL_ADMIN_EMAIL}" \
    -y
else
  echo "Existing Drupal installation detected; installation skipped."
fi

vendor/bin/drush cr

echo "Checking OWC configuration alignment..."
vendor/bin/drush config:status

echo "OWC Drupal bootstrap completed."
