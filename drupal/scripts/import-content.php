<?php

declare(strict_types=1);

use Drupal\node\Entity\Node;

require_once __DIR__ . '/migration-common.php';

$file = getenv('OWC_MIGRATION_FILE') ?: '/opt/owc-drupal/migration/content-export.json';
if (!is_file($file)) {
    throw new RuntimeException("Migration input not found: {$file}");
}

$document = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
if (($document['schemaVersion'] ?? null) !== 1 || !is_array($document['records'] ?? null)) {
    throw new InvalidArgumentException('Unsupported or malformed migration document.');
}

$allowedBundles = [
    'news',
    'page',
    'form',
    'report',
    'faq',
    'publication',
    'legislation',
    'tender',
];
$allowedStates = ['draft', 'review', 'approved', 'published', 'archived'];
$storage = \Drupal::entityTypeManager()->getStorage('node');
$summary = [];

foreach ($allowedBundles as $bundle) {
    $summary[$bundle] = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];
}

foreach ($document['records'] as $record) {
    $bundle = is_string($record['contentType'] ?? null) ? $record['contentType'] : '';
    $key = is_string($record['key'] ?? null) ? trim($record['key']) : '';
    $state = is_string($record['status'] ?? null) ? $record['status'] : '';
    $attributes = is_array($record['attributes'] ?? null) ? $record['attributes'] : null;

    if (!in_array($bundle, $allowedBundles, true)) {
        throw new InvalidArgumentException("Unsupported Drupal migration bundle: {$bundle}");
    }

    try {
        if ($key === '' || !in_array($state, $allowedStates, true) || $attributes === null) {
            throw new InvalidArgumentException("Malformed migration record for bundle {$bundle}");
        }
        if (!isset($attributes['title']) || !is_string($attributes['title']) || trim($attributes['title']) === '') {
            throw new InvalidArgumentException("Migration record {$key} has no title");
        }

        $uuid = owc_migration_uuid($key);
        $matches = $storage->loadByProperties(['uuid' => $uuid]);
        $node = $matches ? reset($matches) : null;
        $created = false;

        if (!$node) {
            $node = Node::create([
                'type' => $bundle,
                'uuid' => $uuid,
                'title' => trim($attributes['title']),
            ]);
            $created = true;
        } elseif ($node->bundle() !== $bundle) {
            throw new RuntimeException("Migration UUID collision for {$key}");
        }

        $changed = $created;
        $desiredTitle = trim($attributes['title']);
        if ($node->label() !== $desiredTitle) {
            $node->setTitle($desiredTitle);
            $changed = true;
        }

        foreach ($attributes as $fieldName => $value) {
            if ($fieldName === 'title') {
                continue;
            }
            if (!is_string($fieldName) || !$node->hasField($fieldName)) {
                throw new InvalidArgumentException("Unknown Drupal field {$bundle}.{$fieldName} for {$key}");
            }

            $desired = owc_migration_scalar($value);
            if ($fieldName === 'body') {
                $current = $node->get($fieldName)->value;
                $desiredBody = $desired === null ? null : (string) $desired;
                if ($current !== $desiredBody) {
                    $node->set($fieldName, $desiredBody === null ? null : [
                        'value' => $desiredBody,
                        'format' => 'basic_html',
                    ]);
                    $changed = true;
                }
                continue;
            }

            $current = $node->get($fieldName)->value;
            $desiredComparable = $desired === null ? null : (string) $desired;
            $currentComparable = $current === null ? null : (string) $current;
            if ($currentComparable !== $desiredComparable) {
                $node->set($fieldName, $desired);
                $changed = true;
            }
        }

        if ($node->hasField('moderation_state')) {
            $currentState = $node->get('moderation_state')->value;
            if ($currentState !== $state) {
                $node->set('moderation_state', $state);
                $changed = true;
            }
        }

        $published = $record['status'] === 'published';
        if ((bool) $node->isPublished() !== $published) {
            $node->setPublished($published);
            $changed = true;
        }

        if (!$changed) {
            $summary[$bundle]['skipped']++;
            continue;
        }

        $node->setNewRevision(true);
        $node->setRevisionLogMessage('OWC canonical CMS migration: ' . $key);
        $node->save();

        if ($created) {
            $summary[$bundle]['created']++;
        } else {
            $summary[$bundle]['updated']++;
        }
    } catch (Throwable $error) {
        $summary[$bundle]['failed']++;
        throw new RuntimeException(
            "Drupal migration failed for {$key}: {$error->getMessage()}",
            0,
            $error,
        );
    }
}

print json_encode([
    'source' => $document['source'] ?? 'unknown',
    'records' => count($document['records']),
    'bundles' => $summary,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
