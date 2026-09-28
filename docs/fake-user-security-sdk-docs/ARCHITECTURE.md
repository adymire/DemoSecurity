# Architecture

## 1. High-level architecture

```text
                 ┌──────────────────────────────┐
                 │        Application           │
                 │ Web / Mobile / Desktop       │
                 └──────────────┬───────────────┘
                                │
                         SDK / Adapter
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │     Security API / Gateway   │
                 └──────────────┬───────────────┘
                                │
                ┌───────────────┼────────────────┐
                ▼               ▼                ▼
          Identity API      Risk Engine      Event API
                │               │                │
                └───────────────┼────────────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │ Database + Redis/Cache       │
                 │ Users / Devices / Events     │
                 │ Risk / Restrictions / Audit  │
                 └──────────────┬───────────────┘
                                │
                                ▼
                       Admin / Operations
```

## 2. Core principle

The SDK should remain thin.

```text
Platform SDK
   ↓
Collect permitted signals
   ↓
Create signed/nonce-bound event
   ↓
Send to backend
   ↓
Backend correlates history
   ↓
Risk engine evaluates
   ↓
Policy engine decides
   ↓
Response returned
```

## 3. Risk signals

Possible signals include:

- account ID
- installation ID
- device/app instance ID
- platform and OS
- app version
- browser family/version
- coarse network information
- server-observed IP address
- country/region derived by the server
- authentication provider
- login history
- device reuse
- account reuse
- velocity/frequency
- failed authentication attempts
- suspicious automation indicators
- disposable/temporary email-domain indicators
- previous restrictions
- impossible or unusual session patterns

Do not collect a signal merely because it is technically possible. Every signal should have a documented purpose, retention period, and privacy basis.

## 4. Network identity clarification

A browser normally cannot reliably expose a user's private Wi-Fi/router IP to a web server.

The backend can observe the public source IP of the request. A mobile/desktop SDK can collect limited local/network metadata only where the platform permits it and where there is a valid purpose.

Therefore the system should distinguish:

- `serverObservedIp`
- `clientNetworkMetadata`
- `deviceInstallationId`
- `deviceRiskId`
- `browserFingerprintSignals`

Never label all of these as "device IP".

## 5. Identity correlation

A single person may legitimately have:

- multiple devices
- changing IPs
- changing networks
- multiple browsers

Therefore **device reuse is a risk signal, not automatic proof of fraud**.

Use multiple signals and configurable thresholds.

## 6. Risk result

Example:

```json
{
  "decision": "allow",
  "riskLevel": "low",
  "riskScore": 18,
  "reasons": [],
  "restriction": null
}
```

Other decisions:

- `allow`
- `challenge`
- `restrict`
- `temporary_block`
- `permanent_block`

The SDK should not calculate the final score independently.
