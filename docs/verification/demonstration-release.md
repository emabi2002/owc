# OWC Demonstration Release Rehearsal

The OWC Demonstration Release is a repository-side presentation-readiness package. It is deliberately separate from production acceptance and from proof of deployment to an OWC-controlled presentation host.

## Command

```bash
bun run demo:release
```

The default evidence file is:

```text
artifacts/demonstration-release.json
```

Set `OWC_DEMONSTRATION_RELEASE_EVIDENCE_PATH` to write the artifact elsewhere.

## Evidence contract

A successful rehearsal requires:

- all seven presentation-level demonstration UAT scenarios to pass;
- the deterministic 20-claim reporting pack to remain synthetic;
- simulated-payment evidence to retain `simulation=true` and `moneyMovement=false`;
- the seven configured demonstration personas and scenario guide to remain available;
- demonstration terminology verification to pass; and
- `productionAcceptance=false` without exception.

The runner records a release SHA when `GITHUB_SHA` is available or when the local Git revision can be resolved. It writes the evidence file with restricted permissions and does not include presentation-server secret values.

## Presentation host classification

Host configuration is assessed only by the presence of `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` and `DEPLOY_SSH_KEY`. Values are never emitted in release evidence.

If one or more values are absent, the release status is:

```text
REPOSITORY_READY / DEMO_HOST_EXTERNAL
```

If all values are present but no independent host verification has been performed by this release process, the status is:

```text
REPOSITORY_READY / DEMO_HOST_CONFIGURED_PENDING_EXTERNAL_VERIFICATION
```

Configuration alone is never treated as proof that an OWC host was deployed, healthy or accepted.

## Non-production boundary

This release does not constitute production acceptance, live government-agency certification, malware-service certification, payment-network certification, real financial settlement, or authorization for production cutover. Those remain separate external and governance activities.
