# OWC Drupal Content Model

The canonical machine names are defined in `drupal/manifest.json` and must remain aligned with `src/lib/drupal/content.ts`.

Drupal owns only public/editorial content. Restricted claims, medical evidence, banking data, compensation documents and payment records are excluded from the CMS.

Content bundles: `news`, `form`, `report`, `faq`, `publication`, `legislation`, `tender`, `page`.

Field types are intentionally conservative so the existing Next.js adapter can consume the CMS without a UI rewrite. Public files are represented by URL fields during the first migration stage; a later controlled migration may replace those with Drupal Media relationships after the adapter is updated.
