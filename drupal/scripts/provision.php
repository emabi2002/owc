<?php

declare(strict_types=1);

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\user\Entity\Role;
use Drupal\workflows\Entity\Workflow;

$contentTypes = [
  'news' => 'News / Notice',
  'form' => 'Form',
  'report' => 'Report',
  'faq' => 'FAQ',
  'publication' => 'Publication',
  'legislation' => 'Legislation',
  'tender' => 'Tender',
  'page' => 'General Page',
];

foreach ($contentTypes as $id => $label) {
  if (!NodeType::load($id)) {
    NodeType::create(['type' => $id, 'name' => $label])->save();
  }
}

$fields = [
  'field_category' => ['type' => 'string', 'label' => 'Category'],
  'field_excerpt' => ['type' => 'string_long', 'label' => 'Excerpt'],
  'field_image' => ['type' => 'string', 'label' => 'Image URL'],
  'field_featured' => ['type' => 'boolean', 'label' => 'Featured'],
  'field_code' => ['type' => 'string', 'label' => 'Code'],
  'field_file_format' => ['type' => 'string', 'label' => 'File Format'],
  'field_file_size' => ['type' => 'string', 'label' => 'File Size'],
  'field_file_url' => ['type' => 'uri', 'label' => 'File URL'],
  'field_updated_date' => ['type' => 'datetime', 'label' => 'Updated Date'],
  'field_year' => ['type' => 'string', 'label' => 'Year'],
  'field_description' => ['type' => 'string_long', 'label' => 'Description'],
  'field_question' => ['type' => 'string', 'label' => 'Question'],
  'field_answer' => ['type' => 'text_long', 'label' => 'Answer'],
  'field_sort_order' => ['type' => 'integer', 'label' => 'Sort Order'],
  'field_reference' => ['type' => 'string', 'label' => 'Reference'],
  'field_enacted_year' => ['type' => 'string', 'label' => 'Enacted Year'],
  'field_tender_status' => ['type' => 'string', 'label' => 'Tender Status'],
  'field_published_date' => ['type' => 'datetime', 'label' => 'Published Date'],
  'field_closing_date' => ['type' => 'datetime', 'label' => 'Closing Date'],
  'field_navigation_weight' => ['type' => 'integer', 'label' => 'Navigation Weight'],
];

$manifest = json_decode(file_get_contents('/opt/owc-drupal/manifest.json') ?: '{}', true);
$bundleFields = $manifest['fields'] ?? [];
foreach ($bundleFields as $bundle => $names) {
  foreach ($names as $fieldName) {
    $definition = $fields[$fieldName];
    if (!FieldStorageConfig::loadByName('node', $fieldName)) {
      FieldStorageConfig::create([
        'field_name' => $fieldName,
        'entity_type' => 'node',
        'type' => $definition['type'],
        'cardinality' => 1,
      ])->save();
    }
    if (!FieldConfig::loadByName('node', $bundle, $fieldName)) {
      FieldConfig::create([
        'field_name' => $fieldName,
        'entity_type' => 'node',
        'bundle' => $bundle,
        'label' => $definition['label'],
      ])->save();
    }
  }
}

$roles = [
  'cms_administrator' => 'CMS Administrator',
  'content_editor' => 'Content Editor',
  'reviewer' => 'Reviewer',
  'publisher' => 'Publisher / Approver',
  'auditor' => 'Auditor / Read-only',
];
foreach ($roles as $id => $label) {
  if (!Role::load($id)) {
    Role::create(['id' => $id, 'label' => $label])->save();
  }
}

if (!Workflow::load('owc_editorial')) {
  Workflow::create([
    'id' => 'owc_editorial',
    'label' => 'OWC Editorial Workflow',
    'type' => 'content_moderation',
    'type_settings' => [
      'states' => [
        'draft' => ['label' => 'Draft', 'weight' => 0, 'published' => false, 'default_revision' => false],
        'review' => ['label' => 'Review', 'weight' => 1, 'published' => false, 'default_revision' => false],
        'approved' => ['label' => 'Approved', 'weight' => 2, 'published' => false, 'default_revision' => false],
        'published' => ['label' => 'Published', 'weight' => 3, 'published' => true, 'default_revision' => true],
        'archived' => ['label' => 'Archived', 'weight' => 4, 'published' => false, 'default_revision' => true],
      ],
      'transitions' => [
        'submit_for_review' => ['label' => 'Submit for review', 'from' => ['draft'], 'to' => 'review', 'weight' => 0],
        'approve' => ['label' => 'Approve', 'from' => ['review'], 'to' => 'approved', 'weight' => 1],
        'publish' => ['label' => 'Publish', 'from' => ['approved'], 'to' => 'published', 'weight' => 2],
        'archive' => ['label' => 'Archive', 'from' => ['published'], 'to' => 'archived', 'weight' => 3],
        'return_to_draft' => ['label' => 'Return to draft', 'from' => ['review', 'approved'], 'to' => 'draft', 'weight' => 4],
      ],
      'entity_types' => ['node' => array_keys($contentTypes)],
      'default_moderation_state' => 'draft',
    ],
  ])->save();
}

$allContentPermissions = [];
foreach (array_keys($contentTypes) as $type) {
  $allContentPermissions[] = "create {$type} content";
  $allContentPermissions[] = "edit own {$type} content";
  $allContentPermissions[] = "edit any {$type} content";
}

$rolePermissions = [
  'cms_administrator' => array_merge($allContentPermissions, ['administer nodes', 'administer content types', 'administer users', 'administer permissions', 'administer workflows', 'access content overview', 'view all revisions']),
  'content_editor' => array_merge($allContentPermissions, ['access content overview', 'view latest version', 'use owc_editorial transition submit_for_review', 'use owc_editorial transition return_to_draft']),
  'reviewer' => ['access content overview', 'view latest version', 'view any unpublished content', 'use owc_editorial transition approve', 'use owc_editorial transition return_to_draft'],
  'publisher' => ['access content overview', 'view latest version', 'view any unpublished content', 'use owc_editorial transition publish', 'use owc_editorial transition archive'],
  'auditor' => ['access content overview', 'view all revisions', 'view latest version'],
];

foreach ($rolePermissions as $roleId => $permissions) {
  $role = Role::load($roleId);
  if (!$role) {
    continue;
  }
  foreach ($permissions as $permission) {
    $role->grantPermission($permission);
  }
  $role->save();
}

$anonymous = Role::load(Role::ANONYMOUS_ID);
if ($anonymous) {
  $anonymous->grantPermission('access content');
  $anonymous->save();
}

print "OWC Drupal content model and governance provisioned.\n";
