# Payments and Plans Integration

Payments are intentionally treated as a separate module from fake-user detection.

## Flow

```text
Desktop App
   ↓
Default Browser
   ↓
Payment Provider
   ↓
Provider Webhook
   ↓
Backend Verification
   ↓
DB
   ↓
Plan Activated
   ↓
Desktop App refreshes entitlement
```

The desktop app must not decide that a payment succeeded solely because a browser redirect occurred.

## Entitlements

Backend stores:

- plan
- status
- start date
- expiry date
- limits
- usage
- billing provider reference

The security system can use plan/usage data as one abuse signal, but billing remains authoritative in the billing service.

## Free-plan abuse

Example:

```text
User A
  ↓
Free credits consumed
  ↓
New account
  ↓
Same installation/device-risk correlation
  ↓
Risk engine
  ↓
Policy
  ↓
Challenge / restrict
```

Changing an email or OAuth provider should not automatically reset credits or entitlement history.
