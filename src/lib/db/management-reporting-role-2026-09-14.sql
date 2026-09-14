-- OWC Management / Executive reporting role upgrade.
-- Safe for already-provisioned demonstration databases.
-- The role is intentionally not added to claim mutation policies.

alter type public.app_role add value if not exists 'management';
