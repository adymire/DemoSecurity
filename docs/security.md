# Security and privacy model

## Threats addressed

- Fake-account bursts, disposable identities, credential stuffing, token replay, abusive prompt loops, forged payment callbacks, and malicious desktop clients.

## Required controls

- OAuth authorization code + PKCE where supported; state and nonce validation; exact callback allowlists.
- Argon-free provider login: never store provider passwords. Encrypt any refresh token and rotate secrets.
- Server-side authorization guards for every admin, billing, and prompt endpoint.
- Rate limits by account, provider identity, IP prefix, and device signal; never rely on one fingerprint.
- Hash risk signals with a server-side pepper. Store only what is necessary, set `expiresAt`, and document retention/consent.
- Generic duplicate-account messages. Do not expose another account's email or profile data.
- Three statuses are supported: `TEMPORARY_BLOCK` (until a timestamp), `RESTRICTED` (specific capabilities denied), and `PERMANENT_BLOCK` (appeal/admin workflow required).
- Payment updates occur only after signature verification, event deduplication, and reconciliation.
- Desktop applications are untrusted. A packaged binary cannot hide a secret or guarantee that its code cannot be inspected. Keep enforcement and sensitive logic server-side; use code signing, OS keychain storage, TLS pinning only with a rotation plan, and obfuscation as defense-in-depth—not as a security boundary.

## Privacy limits

A browser cannot reliably provide a Wi-Fi/router IP or hardware IP. Capture the server-observed source IP only when lawful and necessary. Country can be derived approximately from an IP, not treated as exact location. Provide notice, retention/deletion controls, access/appeal paths, and regional compliance review before launch.
