# API Contract

Base URL:

```text
https://security.example.com/api/v1
```

## Register installation

```http
POST /installations
```

Request:

```json
{
  "appId": "my-app",
  "platform": "flutter",
  "appVersion": "1.0.0",
  "installationId": "client-generated-id"
}
```

## Create security session

```http
POST /sessions
```

The backend determines server-observed network information.

## Send event

```http
POST /security-events
```

```json
{
  "type": "LOGIN",
  "installationId": "installation-id",
  "metadata": {
    "authProvider": "google"
  }
}
```

## Evaluate

```http
POST /risk/evaluate
```

```json
{
  "userId": "user-id",
  "installationId": "installation-id",
  "action": "signup"
}
```

Response:

```json
{
  "decision": "allow",
  "riskLevel": "low",
  "riskScore": 12,
  "restriction": null
}
```

## Admin restriction

```http
POST /admin/restrictions
```

Only authorized administrators can call this endpoint.

## Important

All endpoints must use:

- TLS
- authentication
- authorization
- schema validation
- rate limiting
- replay protection where applicable
- audit logging
- request IDs
