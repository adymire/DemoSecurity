# Backend Microservices

Start modular; deploy as a modular monolith if traffic is small. Split services when operationally justified.

## Suggested services

### API Gateway

- authentication
- rate limiting
- request IDs
- routing
- TLS termination

### Identity Service

- user identity
- account linking
- OAuth references
- sessions

### Event Service

- ingest security events
- validation
- queueing

### Risk Service

- signal aggregation
- scoring
- reason codes

### Policy Service

- thresholds
- decisions
- policy versions

### Restriction Service

- account restrictions
- expiration
- enforcement state

### Notification Service

- security alerts
- admin notifications

### Admin Service

- admin APIs
- audit logs
- configuration

## Queue

For high traffic:

```text
SDK
 ↓
API Gateway
 ↓
Event API
 ↓
Queue
 ↓
Workers
 ↓
Risk / Analytics
```

Real-time actions can still call the Risk API synchronously when necessary.
