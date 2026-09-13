# Deployment — Ubuntu Server 24.04 LTS

Production deployment of the OWC PNG portal behind Nginx + TLS, run by PM2 (or
systemd), with a versioned health-checked application release workflow.

## 0. Prerequisites
- Ubuntu Server 24.04 LTS, a sudo user, DNS A/AAAA records for `owc.gov.pg`.
- A dedicated OWC Supabase project (URL + anon + service-role keys).
- Git, Bun, PM2 and `curl` installed on the application host.
- PostgreSQL client tools (`pg_dump`, `pg_restore`) available to designated backup/recovery operators where repository-managed dumps are used.
- The production checkout must remain on `main` and must not contain local tracked/untracked changes when an automated release begins.

## 1. System packages
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx git ufw curl postgresql-client
# Bun (runtime + package manager)
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
# PM2 (via Bun) for process management
bun add -g pm2
```

## 2. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Do not expose port 3000 publicly. Nginx is the public entry point; the Next.js application listens locally and external databases/services should be reached only through approved network paths.

## 3. Get the code
```bash
sudo mkdir -p /var/www/owc && sudo chown -R $USER:$USER /var/www/owc
git clone https://github.com/emabi2002/owc.git /var/www/owc
cd /var/www/owc
git checkout main
```

## 4. Environment and secrets
```bash
cp .env.example .env.local
nano .env.local
```

`.env.local` is git-ignored and read by Next.js at build/runtime. Do not commit service-role keys, evidence-signing secrets, scanner/notification credentials, OIDC client secrets, CPPS credentials or external-agency credentials.

Production configuration must be reconciled against the operational-readiness controls before go-live. An environment variable being present is not proof that the associated external service has passed connectivity, UAT or security acceptance.

Recovery archives must not be used as a secret-distribution mechanism. Runtime credentials are restored from the approved secret manager or break-glass process, not from database/media/evidence backup archives.

## 5. Provision the database (controlled action)

Apply the approved database baselines/migrations to the dedicated OWC environment using a controlled change procedure. At minimum, the application schema and claims-evidence/notification contracts must match the release being deployed.

Do **not** run destructive or unreviewed schema changes automatically from the application-release script. Database migration and rollback are separate controlled activities because application rollback cannot undo a data/schema change safely.

## 6. Initial build & start
```bash
bun install --frozen-lockfile
bun run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # run the printed command to enable boot start
curl --fail http://127.0.0.1:3000/api/health
```

The application should listen on `127.0.0.1:3000` and the dedicated health endpoint must succeed before Nginx/DNS cutover.

> The repository also contains a systemd unit for sites that standardize on systemd. The automated GitHub deployment path currently targets PM2; select one production process manager and document that operational decision before go-live.

## 7. Nginx reverse proxy
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/owc
sudo ln -s /etc/nginx/sites-available/owc /etc/nginx/sites-enabled/owc
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Verify that only approved public endpoints are reachable and that restricted administration, database, Drupal administration and service credentials are not exposed through Nginx.

## 8. TLS
```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d owc.gov.pg -d www.owc.gov.pg
```

Certbot normally installs a renewal timer. Confirm renewal is active and test it according to the production change procedure. Government-issued or centrally managed certificates may replace Let's Encrypt if required by OWC hosting policy.

## 9. Health-checked application release

The production application release behavior is versioned in `deploy/release.sh`. GitHub Actions connects over SSH, changes to the configured deployment path and executes that script rather than embedding release logic in the workflow.

Manual execution:

```bash
cd /var/www/owc
bash deploy/release.sh
```

The script:

1. verifies `git`, `bun`, `pm2` and `curl` are available;
2. verifies the checkout is on the configured deployment branch (`main` by default);
3. refuses to deploy over local changes;
4. records the currently deployed Git SHA;
5. fetches and fast-forwards to `origin/main` only;
6. installs the lockfile-pinned dependencies and builds the release;
7. reloads/starts PM2 and saves the process list;
8. probes `http://127.0.0.1:3000/api/health` with bounded retries;
9. if the new revision fails, resets the **application repository** to the previous SHA, rebuilds/reloads it and rechecks health.

Optional runtime controls:

```bash
OWC_DEPLOY_BRANCH=main \
OWC_HEALTH_URL=http://127.0.0.1:3000/api/health \
OWC_HEALTH_ATTEMPTS=20 \
OWC_HEALTH_DELAY_SECONDS=3 \
bash deploy/release.sh
```

### Rollback boundary

This is **application-code rollback only**. It does not reverse database migrations, Drupal editorial changes, object-storage changes, CPPS transactions or external-agency transactions. Changes to those systems need their own tested rollback/reconciliation procedures under the backup/DR and cutover work packages.

If the rollback revision itself does not pass `/api/health`, the script exits with a critical failure and operations must escalate rather than continuing to deploy.

## 10. GitHub Actions deployment

`.github/workflows/deploy.yml` runs tests, lint/type-check, build and Drupal clean-room reconstruction on the tracked development branches. It also performs **shell syntax validation only** for `deploy/backup/*.sh`; CI does not run a live backup or restore. The SSH production deployment job is restricted to a direct push to `main`.

Required repository/environment secrets for SSH deployment include the deployment host, user, key, port and path. Application/service credentials belong in the protected production runtime environment on the host or approved secret store; they should not be echoed by the workflow.

## 11. Docker alternative
```bash
docker compose up -d --build
```

A Docker/container deployment still requires the same external controls: TLS/reverse proxy, secret management, private service networking, health monitoring, backups and formal acceptance. Do not describe the existence of a Dockerfile/Compose file as a provisioned production environment.

## 12. Backup and disaster recovery

Repository recovery tooling lives under `deploy/backup/` and is governed by `docs/operations/backup-disaster-recovery.md`.

A backup set may contain:

- `application-db.dump` — PostgreSQL custom-format application database dump;
- `drupal-db.dump` — Drupal PostgreSQL custom-format dump;
- `drupal-media.tar.gz` — Drupal public uploaded files only;
- `evidence-export.tar.gz` — archive of an **operator-provided** read-only evidence export;
- `backup-manifest.json` — environment label, creation time and Git release SHA without secrets;
- `SHA256SUMS` — mandatory integrity checksums.

Production scheduling, provider PITR, retention and off-host copy are infrastructure/operations decisions and must be configured only after OWC approves recovery objectives. The repository deliberately does not invent RPO/RTO values.

### Recovery rehearsal safety

Repository restore scripts are intentionally non-production rehearsal tools. They require `OWC_DR_REHEARSAL_CONFIRM=NONPRODUCTION`, reject `prod`/`production`/`live` environment labels, require a database name ending `_dr_rehearsal`, and require an isolated Drupal Compose project containing `dr-rehearsal`.

Do not weaken these guards to perform a production incident recovery. Production recovery must follow the formally approved incident/cutover procedure using verified backup evidence and named authority.

CPPS and external-authority transactions are not backed up or replayed. After recovery, OWC local state must be reconciled against CPPS as the authoritative claim/payment source before service is accepted.

## Operations
- Local health: `curl --fail http://127.0.0.1:3000/api/health`.
- Public health/smoke: use an approved externally monitored URL after TLS/DNS are active; do not expose sensitive readiness details publicly.
- Logs: `pm2 logs owc-png` (or the selected systemd/container logging path).
- Restart: `pm2 reload ecosystem.config.js --update-env`.
- Nginx validation: `sudo nginx -t` before every proxy configuration reload.
- TLS: monitor certificate expiry/renewal.
- Backups/restores: follow `docs/operations/backup-disaster-recovery.md`; backup success alone is not restore evidence.
- RPO/RTO: record formal approval in `docs/operations/rpo-rto-decision-record.md`.
- Restore rehearsal: record every exercise using `docs/operations/restore-rehearsal-evidence-template.md`.
- External integrations: readiness/configuration does not equal live agency acceptance.

## Production acceptance still required

Repository assets do not provision the actual OWC host. Before production infrastructure/recovery can be called live-complete, verify on the nominated environment:

- approved host/container platform and OS baseline;
- DNS and TLS;
- firewall/WAF/network segmentation;
- production secret storage and least privilege;
- production Supabase/database/object storage;
- Drupal production deployment and editor identity connectivity;
- log retention, metrics, uptime monitoring and alert routing;
- scanner, notification, CPPS and approved agency connectivity as applicable;
- approved RPO/RTO, backup frequency and retention;
- provider PITR/database backup where applicable;
- Drupal DB/media and evidence-repository backup schedule;
- logically separate/off-host backup copy;
- successful isolated restore rehearsal with documented evidence;
- CPPS reconciliation validation;
- external vulnerability/security testing and operational sign-off.

## Troubleshooting
| Symptom | Action |
| --- | --- |
| Release refuses dirty checkout | Review `git status`; preserve/investigate local changes instead of overwriting them. |
| New release health fails | `deploy/release.sh` attempts application rollback automatically; inspect PM2/app logs and the deployment exit code. |
| Rollback health also fails | Escalate as a production incident; do not continue automated release attempts. |
| Backup checksum verification fails | Quarantine the backup set; do not restore it. Recreate or recover from an independently verified copy. |
| Restore script refuses the target | Confirm the exercise is non-production and use the required rehearsal-only target naming; do not bypass the guard. |
| 502 from Nginx | Check local `/api/health`, PM2 status/logs and Nginx upstream configuration. |
| Login fails | Verify the correct production identity/Supabase configuration without exposing credentials. |
| Drupal content unavailable | Check Drupal service health, content-source policy and approved CMS connectivity. |
