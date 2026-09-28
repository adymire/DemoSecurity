# Auth and Onboarding Integration

The host application may use:

- Google OAuth
- GitHub OAuth
- email/password
- other providers

## Flow

```text
Signup/Login
    ↓
Host Backend validates OAuth
    ↓
User created/found
    ↓
Security SDK creates/updates installation
    ↓
Security event
    ↓
Risk evaluation
    ↓
Policy decision
    ↓
Session issued
```

If an existing account authenticates through another provider, the host application's account-linking rules decide whether identities are merged.

Do not create duplicate user accounts merely because Google and GitHub emails differ unless the host application intentionally supports that model.

## Admin

New users and onboarding information should be fetched from the host application's backend or an authorized security API.

Do not expose raw OAuth access tokens to admin UI.
