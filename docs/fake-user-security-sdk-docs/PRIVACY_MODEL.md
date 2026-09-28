# Privacy Model

This project handles security-related telemetry, so privacy must be designed into the architecture.

## Data minimization

Collect only what is necessary for the declared security purpose.

## Recommended separation

```text
Account Identity
        +
Security Signals
        +
Audit Data
```

Use stable internal IDs rather than spreading raw email addresses through security tables.

## Email

For correlation, applications can store:

- normalized email hash
- domain
- masked email for admin UI

Avoid exposing the full email unnecessarily.

Example admin display:

```text
us****32@gmail.com
```

## IP and location

Store only what the application's privacy policy and legal basis permit.

Country/region can be derived server-side from an IP service/database where appropriate.

Do not attempt to expose private Wi-Fi IPs from a browser.

## Retention

Retention should be configurable:

```text
security events: configurable
raw network data: shortest practical period
audit logs: according to operational/legal requirements
account restrictions: while needed
```

Provide deletion/export mechanisms where applicable.

## Transparency

The integrating application should explain relevant security telemetry in its privacy notice and terms.
