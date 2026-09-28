# Data Model

The exact database can be PostgreSQL, MongoDB, or another supported database. The SDK must not depend on one database implementation.

## User

```text
User
- id
- externalAccountId
- authProvider
- emailHash
- emailDomain
- status
- createdAt
- updatedAt
```

## Installation

```text
Installation
- id
- userId
- platform
- appId
- appVersion
- deviceRiskId
- firstSeenAt
- lastSeenAt
- status
```

## Session

```text
Session
- id
- userId
- installationId
- authMethod
- serverObservedIp
- countryCode
- userAgentHash
- createdAt
- endedAt
```

## Security Event

```text
SecurityEvent
- id
- userId
- installationId
- type
- riskScore
- metadata
- createdAt
```

## Restriction

```text
Restriction
- id
- userId
- type
- reasonCode
- createdBy
- startsAt
- expiresAt
- active
- createdAt
```

Restriction types:

- `temporary_block`
- `permanent_block`
- `restricted`
- `challenge_required`

## Admin Audit Log

```text
AdminAuditLog
- id
- adminId
- action
- targetType
- targetId
- before
- after
- createdAt
```

Never store raw secrets, passwords, OAuth tokens, or payment credentials in these records.
