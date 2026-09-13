#!/usr/bin/env bash
set -euo pipefail

DEPLOY_BRANCH="${OWC_DEPLOY_BRANCH:-main}"
HEALTH_URL="${OWC_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
HEALTH_ATTEMPTS="${OWC_HEALTH_ATTEMPTS:-20}"
HEALTH_DELAY_SECONDS="${OWC_HEALTH_DELAY_SECONDS:-3}"

log() {
  printf '[owc-deploy] %s\n' "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Required command is unavailable: $1"
    exit 1
  fi
}

wait_for_health() {
  local attempt
  for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt += 1)); do
    if curl --fail --silent --show-error --max-time 5 "$HEALTH_URL" >/dev/null; then
      log "Health check passed on attempt ${attempt}/${HEALTH_ATTEMPTS}."
      return 0
    fi
    log "Health check ${attempt}/${HEALTH_ATTEMPTS} failed; retrying in ${HEALTH_DELAY_SECONDS}s."
    sleep "$HEALTH_DELAY_SECONDS"
  done
  return 1
}

for command_name in git bun pm2 curl; do
  require_command "$command_name"
done

if [[ "$(git rev-parse --is-inside-work-tree 2>/dev/null || true)" != "true" ]]; then
  log "Deployment path is not a Git working tree."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]]; then
  log "Deployment checkout must be on '${DEPLOY_BRANCH}', found '${CURRENT_BRANCH:-detached HEAD}'."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  log "Deployment checkout contains local changes. Refusing to overwrite them."
  git status --short
  exit 1
fi

PREVIOUS_SHA="$(git rev-parse HEAD)"
log "Current application revision: $PREVIOUS_SHA"

rollback() {
  log "Release failed. Restoring previous application revision $PREVIOUS_SHA."
  git reset --hard "$PREVIOUS_SHA"
  bun install --frozen-lockfile
  bun run build
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
  pm2 save

  if wait_for_health; then
    log "Rollback completed and the previous application revision is healthy."
  else
    log "CRITICAL: rollback completed but the application health check is still failing."
    return 1
  fi
}

release() {
  log "Fetching origin/${DEPLOY_BRANCH}."
  git fetch --prune origin "$DEPLOY_BRANCH" || return 1

  local target_sha
  target_sha="$(git rev-parse "origin/${DEPLOY_BRANCH}")" || return 1
  log "Target application revision: $target_sha"

  git merge --ff-only "origin/${DEPLOY_BRANCH}" || return 1
  bun install --frozen-lockfile || return 1
  bun run build || return 1
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js || return 1
  pm2 save || return 1

  if ! wait_for_health; then
    log "New revision did not pass the application health check."
    return 1
  fi

  log "Release successful at $(git rev-parse HEAD)."
}

if ! release; then
  if ! rollback; then
    exit 2
  fi
  exit 1
fi
