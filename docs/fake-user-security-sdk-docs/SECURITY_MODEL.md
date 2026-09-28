# Security Model

## Threat model

Protect against:

- fake account creation
- disposable-email abuse
- multi-account free-plan abuse
- scripted signup
- credential stuffing
- session replay
- API abuse
- request flooding
- device/account reuse
- manipulated client SDK requests

## Client is untrusted

Never trust:

- client risk score
- client payment status
- client account status
- client-generated admin flags
- client-generated IP address

The server must derive authoritative values wherever possible.

## SDK integrity

The SDK should support:

- signed event payloads where appropriate
- nonce / timestamp validation
- request IDs
- TLS
- short-lived credentials
- package version reporting
- optional application attestation adapters

The SDK must not contain backend master secrets.

## Desktop application

Sensitive local "Brain" or application code should not be treated as perfectly secret. A distributed desktop binary can ultimately be inspected.

Use:

- code signing
- secure packaging
- encrypted local storage for secrets
- OS credential/keychain APIs
- short-lived server credentials
- server-side authorization

Do not embed permanent backend secrets inside the desktop app.
