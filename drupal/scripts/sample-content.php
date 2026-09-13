<?php

declare(strict_types=1);

use Drupal\node\Entity\Node;

$samples = [
  'news' => [
    'title' => 'OWC Service Information',
    'field_category' => 'Announcement',
    'field_excerpt' => 'Current service information from the Office of Workers Compensation.',
    'field_featured' => true,
  ],
  'form' => [
    'title' => 'Worker Compensation Claim Form',
    'field_code' => 'WC-1',
    'field_category' => 'Claims',
    'field_file_format' => 'PDF',
    'field_file_size' => '1 MB',
    'field_file_url' => 'https://owc.gov.pg/forms/wc-1.pdf',
  ],
  'page' => [
    'title' => 'Workers Compensation Services',
    'field_category' => 'Services',
    'field_navigation_weight' => 10,
  ],
];

$storage = \Drupal::entityTypeManager()->getStorage('node');
foreach ($samples as $type => $values) {
  $existing = $storage->loadByProperties(['type' => $type, 'title' => $values['title']]);
  if ($existing) {
    continue;
  }
  $node = Node::create(array_merge(['type' => $type, 'status' => 1], $values));
  if ($node->hasField('moderation_state')) {
    $node->set('moderation_state', 'published');
  }
  $node->save();
}

print "OWC Drupal sample public content ensured.\n";
