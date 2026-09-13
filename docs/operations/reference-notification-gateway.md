# OWC Reference Notification Gateway

## Purpose

The reference notification gateway exists only for controlled OWC development, UAT and demonstration workflows when an approved live email/SMS provider is not yet available. It is explicitly **synthetic** and does not send messages to real recipients.

## Enablement

Set `OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY=true` only in an approved non-production demonstration environment. The default is `false`.

A configured `OWC_NOTIFICATION_API_URL` live notification gateway is always authoritative. If that live gateway is configured and fails, OWC records the live failure; it does not fall back to a synthetic successful delivery.

If neither a live gateway nor the reference gateway is configured, the existing OWC behavior remains `queued` so the delivery can be retried when an approved provider becomes available.

## Synthetic delivery behavior

The reference gateway supports the same `email` and `sms` channels as the OWC notification contract. It performs no network request. A deterministic provider message ID is derived from the notification channel, recipient, subject, message, claim reference and lifecycle event. Repeating the same synthetic request produces the same identifier and only one process-local captured delivery.

Reference delivery results are labelled with `source: "reference"`, `productionConnected: false` and `deterministic: true`.

The process-local delivery list is demonstration evidence only. It is non-durable and must not be treated as proof of carrier, SMTP, SMS aggregator or recipient delivery.

## Privacy boundary

Use only synthetic demonstration claimants, addresses and phone numbers with the reference gateway. Production claimant contact information must not be inserted into demonstration fixtures or screenshots. Existing notification message construction remains responsible for excluding medical and banking detail from claimant-safe lifecycle messages.

## post-award migration

In the post-award environment, configure the approved live notification gateway URL and credentials and leave the reference flag disabled. The application delivery contract remains unchanged, so provider replacement is configuration-led rather than a redesign of claim lifecycle notifications.

Production acceptance requires approved provider details, security review, DEV/UAT connectivity, email and SMS delivery evidence, retry/failure-mode testing, sender identity approval where applicable, monitoring and formal operational sign-off.
