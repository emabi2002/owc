#!/usr/bin/env bash
set -euo pipefail
cd /opt/drupal

vendor/bin/drush status --fields=bootstrap,db-status,drupal-version
vendor/bin/drush pml --status=enabled --type=module --format=list | grep -E '^(jsonapi|serialization|workflows|content_moderation|media|media_library)$'
vendor/bin/drush php:eval 'foreach (["news","form","report","faq","publication","legislation","tender","page"] as $type) { if (!\Drupal\node\Entity\NodeType::load($type)) { throw new \RuntimeException("Missing content type: {$type}"); } }'
vendor/bin/drush php:eval 'foreach (["cms_administrator","content_editor","reviewer","publisher","auditor"] as $role) { if (!\Drupal\user\Entity\Role::load($role)) { throw new \RuntimeException("Missing role: {$role}"); } }'
vendor/bin/drush php:eval 'if (!\Drupal\workflows\Entity\Workflow::load("owc_editorial")) { throw new \RuntimeException("Missing OWC editorial workflow"); }'

echo "Drupal verification passed."
