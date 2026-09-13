#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:-/opt/owc-drupal/migration/content-export.json}"

if [[ ! -f "$INPUT" ]]; then
  echo "Migration input not found: $INPUT" >&2
  exit 1
fi

OWC_MIGRATION_FILE="$INPUT" vendor/bin/drush php:script /opt/owc-drupal/scripts/verify-content-parity.php
