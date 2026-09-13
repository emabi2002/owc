<?php

declare(strict_types=1);

require_once __DIR__ . '/migration-common.php';

$file = getenv('OWC_MIGRATION_FILE') ?: '/opt/owc-drupal/migration/content-export.json';
if (!is_file($file)) {
    throw new RuntimeException("Migration input not found: {$file}");
}

$document = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
if (($document['schemaVersion'] ?? null) !== 1 || !is_array($document['records'] ?? null)) {
    throw new InvalidArgumentException('Unsupported or malformed migration document.');
}

$storage = \Drupal::entityTypeManager()->getStorage('node');
$issues = [];
$expectedCounts = [];

$comparable = static function (mixed $value): ?string {
    if ($value === null) {
        return null;
    }
    if (is_bool($value)) {
        return $value ? '1' : '0';
    }
    return (string) $value;
};

foreach ($document['records'] as $record) {
    $bundle = is_string($record['contentType'] ?? null) ? $record['contentType'] : '';
    $key = is_string($record['key'] ?? null) ? $record['key'] : '';
    $state = is_string($record['status'] ?? null) ? $record['status'] : '';
    $attributes = is_array($record['attributes'] ?? null) ? $record['attributes'] : [];
    $expectedCounts[$bundle] = ($expectedCounts[$bundle] ?? 0) + 1;

    $uuid = owc_migration_uuid($key);
    $matches = $storage->loadByProperties(['uuid' => $uuid]);
    $node = $matches ? reset($matches) : null;

    if (!$node) {
        $issues[] = ['type' => 'missing', 'key' => $key, 'uuid' => $uuid];
        continue;
    }

    if ($node->bundle() !== $bundle) {
        $issues[] = [
            'type' => 'bundle_mismatch',
            'key' => $key,
            'expected' => $bundle,
            'actual' => $node->bundle(),
        ];
        continue;
    }

    if (isset($attributes['title']) && $node->label() !== (string) $attributes['title']) {
        $issues[] = [
            'type' => 'field_mismatch',
            'key' => $key,
            'field' => 'title',
            'expected' => (string) $attributes['title'],
            'actual' => $node->label(),
        ];
    }

    foreach ($attributes as $fieldName => $desired) {
        if ($fieldName === 'title') {
            continue;
        }
        if (!$node->hasField($fieldName)) {
            $issues[] = [
                'type' => 'field_mismatch',
                'key' => $key,
                'field' => $fieldName,
                'expected' => $desired,
                'actual' => '__missing_field__',
            ];
            continue;
        }
        $actual = $node->get($fieldName)->value;
        if ($comparable($actual) !== $comparable($desired)) {
            $issues[] = [
                'type' => 'field_mismatch',
                'key' => $key,
                'field' => $fieldName,
                'expected' => $desired,
                'actual' => $actual,
            ];
        }
    }

    $actualState = $node->hasField('moderation_state')
        ? $node->get('moderation_state')->value
        : null;
    $actualPublished = (bool) $node->isPublished();
    $expectedPublished = $state === 'published';
    if ($actualState !== $state || $actualPublished !== $expectedPublished) {
        $issues[] = [
            'type' => 'state_mismatch',
            'key' => $key,
            'expected' => ['moderation_state' => $state, 'published' => $expectedPublished],
            'actual' => ['moderation_state' => $actualState, 'published' => $actualPublished],
        ];
    }
}

foreach ($expectedCounts as $bundle => $expected) {
    $query = $storage->getQuery()->accessCheck(false)->condition('type', $bundle);
    $actual = count($query->execute());
    if ($actual !== $expected) {
        $issues[] = [
            'type' => 'count_mismatch',
            'bundle' => $bundle,
            'expected' => $expected,
            'actual' => $actual,
        ];
    }
}

$result = [
    'records' => count($document['records']),
    'expectedCounts' => $expectedCounts,
    'issueCount' => count($issues),
    'issues' => $issues,
];

print json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;

if ($issues) {
    throw new RuntimeException('Drupal content parity verification failed with ' . count($issues) . ' discrepancy(s).');
}
