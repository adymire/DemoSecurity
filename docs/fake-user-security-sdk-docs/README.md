# Open Fraud & Fake-User Detection SDK

A standalone, open-source, technology-agnostic security and abuse-detection system that can be integrated into web apps, backend services, desktop apps, Android apps, and cross-platform mobile apps.

## Goal

This repository is **not tied to CyberFallen or any single product**. Any application should be able to:

1. Clone the repository.
2. Use only the SDK/package required by its technology.
3. Connect the SDK to its own backend and database.
4. Register/login a user and create a security identity.
5. Detect suspicious account reuse, device reuse, automation, spam, and abuse.
6. Send risk events to the backend.
7. Apply configurable actions such as allow, challenge, restrict, temporary block, or permanent block.
8. View security events from an admin system.

## Supported integration families

### Web / Backend

- React
- Next.js
- JavaScript / Node.js
- NestJS
- Python
- PHP
- Go
- Additional adapters can be added later.

### Mobile

- Android XML + Java
- Android Kotlin + Jetpack
- Flutter
- React Native

### Desktop

Desktop applications can use the same backend protocol and a native/local adapter where required.

## Important architecture rule

The SDK is an **event and risk-signal collector**, not the final security authority.

The backend is authoritative for:

- identity
- account state
- device associations
- risk decisions
- restrictions
- quotas
- abuse history
- admin actions

Never trust a client-side "safe", "payment successful", or "verified" flag by itself.
