# Deployment — Ubuntu Server 24.04 LTS

Production deployment of the OWC PNG portal behind Nginx + TLS, run by PM2 (or
systemd), with a Git pull/build/reload update workflow.

## 0. Prerequisites
- Ubuntu Server 24.04 LTS, a sudo user, DNS A/AAAA records for `owc.gov.pg`.
- A Supabase project (URL + anon + service-role keys).

## 1. System packages
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx git ufw
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

## 3. Get the code
```bash
sudo mkdir -p /var/www/owc && sudo chown -R $USER:$USER /var/www/owc
git clone https://github.com/emabi2002/owc.git /var/www/owc
cd /var/www/owc
```

## 4. Environment
```bash
cp .env.example .env.local
nano .env.local   # set NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
                  # OWC_BOOTSTRAP_ADMIN_EMAILS, CPPS_* and CAPTCHA_* as needed
```
`.env.local` is git-ignored and read by Next.js at build and runtime.

## 5. Provision the database (once)
Run `src/lib/db/schema.sql` in the Supabase SQL editor, then:
```bash
bun install --frozen-lockfile
bun run setup     # creates the admin user + role + seed content
```

## 6. Build & start
```bash
bun run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # run the printed command to enable boot start
```
The app now listens on `127.0.0.1:3000`.

> Alternatively use systemd: `sudo cp deploy/owc.service /etc/systemd/system/`
> then `sudo systemctl enable --now owc`.

## 7. Nginx reverse proxy
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/owc
sudo ln -s /etc/nginx/sites-available/owc /etc/nginx/sites-enabled/owc
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 8. TLS (Let's Encrypt)
```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d owc.gov.pg -d www.owc.gov.pg
```
Certbot installs a renewal timer automatically (`systemctl list-timers`).

## 9. Update workflow (Git pull → build → reload)
```bash
cd /var/www/owc
git pull --ff-only
bun install --frozen-lockfile
bun run build
pm2 reload ecosystem.config.js --update-env
```
This is exactly what `.github/workflows/deploy.yml` runs over SSH when the
`DEPLOY_*` repository secrets are configured.

## 10. Docker alternative
```bash
docker compose up -d --build
# Pass NEXT_PUBLIC_* via the shell/compose env; secrets come from .env.local.
```

## Operations
- Logs: `pm2 logs owc-png` (or `journalctl -u owc -f`).
- Restart: `pm2 reload owc-png`.
- Health: `curl -I https://owc.gov.pg`.
- Backups: enable Point-in-Time Recovery in Supabase; schedule `pg_dump` if self-hosting.

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| 502 from Nginx | Is the app up? `pm2 status`; check `pm2 logs`. |
| Login fails | Verify Supabase keys in `.env.local`; rebuild. |
| Seed content only | Run `schema.sql` + `bun run setup`. |
| Stale build | `rm -rf .next && bun run build && pm2 reload owc-png`. |
