#!/usr/bin/env bash
set -euo pipefail

PROCESS_NAME="${OWC_PROCESS_NAME:-owc-png}"
LOCAL_HEALTH_URL="${OWC_LOCAL_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
PUBLIC_HEALTH_URL="${OWC_PUBLIC_HEALTH_URL:-}"
DISK_WARNING_PERCENT="${OWC_DISK_WARNING_PERCENT:-85}"

log() {
  printf '[owc-monitor] %s\n' "$*"
}

fail() {
  log "FAIL: $*"
  return 1
}

for command_name in curl pm2 df awk; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    log "FAIL: required command is unavailable: $command_name"
    exit 1
  fi
done

failures=0

process_pid="$(pm2 pid "$PROCESS_NAME" 2>/dev/null | tail -n 1 | tr -d '[:space:]' || true)"
if [[ -z "$process_pid" || "$process_pid" == "0" ]]; then
  fail "PM2 process '$PROCESS_NAME' is not running." || failures=$((failures + 1))
else
  log "PASS: PM2 process '$PROCESS_NAME' is running."
fi

if curl --fail --silent --show-error --max-time 5 "$LOCAL_HEALTH_URL" >/dev/null; then
  log "PASS: local application health endpoint responded successfully."
else
  fail "local application health endpoint did not respond successfully." || failures=$((failures + 1))
fi

if [[ -n "$PUBLIC_HEALTH_URL" ]]; then
  if [[ "$PUBLIC_HEALTH_URL" != https://* ]]; then
    fail "OWC_PUBLIC_HEALTH_URL must use HTTPS when configured." || failures=$((failures + 1))
  elif curl --fail --silent --show-error --max-time 10 "$PUBLIC_HEALTH_URL" >/dev/null; then
    log "PASS: public HTTPS smoke endpoint responded successfully."
  else
    fail "public HTTPS smoke endpoint did not respond successfully." || failures=$((failures + 1))
  fi
else
  log "INFO: public HTTPS smoke check is not configured on this host."
fi

disk_percent="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
if [[ ! "$disk_percent" =~ ^[0-9]+$ ]]; then
  fail "unable to determine root filesystem utilization." || failures=$((failures + 1))
elif (( disk_percent >= DISK_WARNING_PERCENT )); then
  fail "root filesystem utilization is ${disk_percent}% (threshold ${DISK_WARNING_PERCENT}%)." || failures=$((failures + 1))
else
  log "PASS: root filesystem utilization is ${disk_percent}% (threshold ${DISK_WARNING_PERCENT}%)."
fi

if (( failures > 0 )); then
  log "Monitoring check completed with ${failures} failure(s)."
  exit 1
fi

log "Monitoring check completed successfully."
