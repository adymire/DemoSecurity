# Deployment

## Development

```text
Docker Compose
├── API
├── Database
├── Redis
└── Worker
```

## Production

```text
Internet
   ↓
WAF / CDN
   ↓
Load Balancer
   ↓
API Gateway
   ↓
Security Services
   ├── Redis
   ├── Queue
   └── Database
```

## Scaling

Stateless APIs should scale horizontally.

Redis can handle:

- rate-limit counters
- short-lived session data
- cache
- distributed locks where required

Database stores durable records.

Queue workers process asynchronous security events.

## Observability

Use:

- structured logs
- request IDs
- metrics
- traces
- error monitoring
- security audit logs

Never log secrets or OAuth access tokens.
