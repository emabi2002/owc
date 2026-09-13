# OWC Content → Drupal Mapping

This document is the migration contract between the transitional OWC content sources and the Drupal enterprise CMS.

| Source | Drupal bundle | Natural key | Core mappings |
|---|---|---|---|
| `news` | `news` | source record ID | title → title; body → body; category → field_category; excerpt → field_excerpt; image URL → field_image; featured → field_featured |
| `pages` | `page` | source record ID | title → title; body → body; category → field_category; navigation weight → field_navigation_weight |
| `forms` | `form` | form code | title → title; code → field_code; category → field_category; format → field_file_format; size → field_file_size; file URL → field_file_url; updated → field_updated_date |
| `reports` | `report` | source record ID | title → title; year → field_year; description → field_description; size → field_file_size; file URL → field_file_url |
| `faqs` | `faq` | source record ID | question → title + field_question; answer → field_answer; category → field_category; order → field_sort_order |
| `publications` | `publication` | source record ID | title → title; category → field_category; description → field_description; year → field_year; format → field_file_format; size → field_file_size; file URL → field_file_url |
| `legislation` | `legislation` | reference, else source ID | title → title; reference → field_reference; category → field_category; description → field_description; enacted year → field_enacted_year; file URL → field_file_url |
| `tenders` | `tender` | tender reference | title → title; reference → field_reference; category → field_category; description → field_description; status → field_tender_status; published/closing dates → corresponding Drupal date fields; file URL → field_file_url |

## Editorial state mapping

| Existing state | Drupal OWC workflow state |
|---|---|
| draft | draft |
| submitted | review |
| approved | approved |
| published | published |
| archived | archived |

The migration must never convert a non-published source record into a published Drupal node.

## Exclusions

Claims, claimant evidence, CPPS data, staff identities, audit events and operational transaction records are not CMS content and must not be migrated into Drupal.

## Cutover rule

During migration, Drupal may operate in shadow/preferred mode while parity is being proven. After acceptance, `CONTENT_SOURCE=drupal` becomes authoritative. Any temporary fallback after that point must be explicitly enabled as a rollback measure rather than occurring silently.
