# Integration Guide

## Recommended integration pattern

```text
Your App
  ↓
SDK Adapter
  ↓
Security Backend
  ↓
Your DB / Security DB
```

The SDK should expose a small API.

Example:

```javascript
const security = createSecurityClient({
  apiUrl: process.env.SECURITY_API_URL,
  appId: "my-app"
});

await security.initialize();

await security.identifyUser({
  userId: user.id
});

const result = await security.evaluate("signup");
```

## React / Next.js

Use the web adapter only. Keep server-only credentials in the server environment.

## Node / NestJS

Use the backend adapter for:

- middleware
- guards
- event publishing
- risk evaluation
- admin APIs

## Python / PHP / Go

Use the HTTP API or native backend SDK.

## Flutter

Use only:

```text
packages/mobile/flutter
packages/core-protocol
```

Do not ship Java/XML/React/Next adapters inside the Flutter application.

## Android

Use either:

```text
packages/mobile/android-java
```

or:

```text
packages/mobile/android-kotlin
```

## React Native

Use:

```text
packages/mobile/react-native
```

with native bridges only where platform capabilities require them.

## Backend database

The SDK should not force an application's primary database schema.

Use a dedicated security database/schema or an adapter layer where practical.
