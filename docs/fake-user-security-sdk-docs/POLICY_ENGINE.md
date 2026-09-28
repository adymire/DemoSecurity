# Policy Engine

Policies determine what happens after risk evaluation.

## Example policies

```text
LOW
→ allow

MEDIUM
→ allow + monitoring

HIGH
→ challenge / restrict

CRITICAL
→ temporary block
```

## Account restriction levels

### Restricted

The account can authenticate but selected actions are disabled.

### Temporary Block

The account is blocked until `expiresAt`.

### Permanent Block

The account remains blocked until an authorized administrator changes the state.

## Admin-configurable policy

Admins should be able to configure:

- threshold values
- free-plan limits
- request limits
- signup velocity
- challenge rules
- restriction duration
- trusted devices
- allowlists
- blocklists
- notification rules

Every policy change should generate an audit event.
