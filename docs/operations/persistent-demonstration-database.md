# Persistent multi-agency demonstration database

This configuration keeps the current OWC user experience while sourcing the synthetic agency records from Supabase PostgreSQL. Supabase creates one PostgreSQL database named `postgres` per project; in this project, institutional separation is demonstrated with private schemas rather than separate physical databases.

## What is represented

The migration creates logically isolated schemas for OWC, NID, IPA, IRC, health facilities, insurers, employers, banks, integration telemetry, audit and reporting. Five deterministic synthetic claim scenarios demonstrate successful, follow-up, declined, fatal-incident and occupational-illness cases. Six private Storage buckets represent each institution's document filesystem.

All records are synthetic. Bank transactions are simulated only, the database forces `money_movement = false`, and no real money can move through this implementation. The schemas are not exposed to browser roles; only narrow RPC functions granted to `service_role` are called by trusted server routes.

## Apply the reviewed migration

1. Open the intended Supabase project and confirm the project reference before making a change.
2. Open **SQL Editor**, create a new query, and paste the complete contents of `supabase/migrations/20260922155151_persistent_multi_agency_demonstration.sql`.
3. Review the selected project again and run the query once. The migration is idempotent and can be run again safely.
4. In Storage, confirm the six `owc-*` buckets exist and are private.

This is the only manual database-write checkpoint. Do not paste secret keys into the SQL Editor or a browser-side variable.

## Configure the application host

Set these server/deployment environment variables without committing their values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
OWC_ENABLE_SANDBOX=true
OWC_PERSISTENT_DEMONSTRATION=true
```

`SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`) is server-only. Never use it in a `NEXT_PUBLIC_` variable, Drupal client code, screenshots, logs, or repository files. Drupal may continue running in the cloud as the editorial content source; this database integration does not change Drupal's UX or content ownership.

Redeploy the application after setting the variables. Persistent mode fails closed if its database or secret is unavailable; it does not silently return the process-local demonstration records.

## Verify safely

From a trusted operator environment containing the same server variables, run:

```sh
bun run db:verify-demonstration
```

The command is read-only. It verifies the five scenario identities, connected service-state records and private buckets without printing credentials or creating a simulated transaction. Application tests also verify the schema constraints that prohibit real-money movement.

Then exercise the existing `/api/integrations/*` routes or the unchanged demonstration screens. Responses should use `source: persistent_demo`, and event/health screens should retain records across application restarts.

## Rollback

Set `OWC_PERSISTENT_DEMONSTRATION=false` and redeploy to return to the existing explicitly enabled process-local demonstration adapter. This rollback is non-destructive: it does not delete schemas, scenarios, audit events or Storage objects. Dropping database objects or deleting buckets requires a separately reviewed and approved operation.
