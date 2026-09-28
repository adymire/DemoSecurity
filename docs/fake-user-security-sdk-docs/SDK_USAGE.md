# Minimal SDK Usage

The intended developer experience is small.

## Web

```javascript
const security = createSecurityClient({
  apiUrl: "https://security.example.com",
  appId: "my-app"
});

await security.initialize();
await security.identifyUser({ userId });

const decision = await security.evaluate("free_action");
```

## Flutter

```dart
final security = SecurityClient(
  apiUrl: 'https://security.example.com',
  appId: 'my-app',
);

await security.initialize();
await security.identifyUser(userId);

final decision = await security.evaluate('free_action');
```

## Backend

```javascript
const decision = await security.evaluate({
  userId,
  action: 'signup'
});
```

The final production API may differ by language, but the conceptual interface should remain consistent.
