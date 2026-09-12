#!/usr/bin/env bash
set -euo pipefail
cd /opt/drupal
vendor/bin/drush php:script /opt/owc-drupal/scripts/sample-content.php
vendor/bin/drush cr
