# Master Build Prompt

Build this repository as a standalone, open-source fake-user / abuse-detection SDK and backend system.

## Non-negotiable goals

1. It must be independent of any single application.
2. It must be cloneable and integrable into arbitrary projects.
3. Keep platform adapters separated.
4. Do not force users to ship unrelated SDKs.
5. Keep backend authority on the server.
6. Make the system database-adapter friendly.
7. Make risk rules configurable.
8. Make privacy and data minimization first-class.
9. Do not treat one IP/device signal as proof of fraud.
10. Provide production-quality documentation and examples.

## Implement

- core event protocol
- SDK interfaces
- backend APIs
- identity integration
- installation/device association
- event ingestion
- risk engine
- policy engine
- restrictions
- admin APIs
- audit logging
- rate limiting
- Redis support
- queue support
- tests
- examples

## Platform directories

Implement separately:

- React
- Next.js
- Node.js
- NestJS
- Python
- PHP
- Go
- Android Java/XML
- Android Kotlin/Jetpack
- Flutter
- React Native

Only add code to the adapter's own folder.

## Quality

Before declaring completion:

- run unit tests
- run integration tests
- run security tests
- validate package boundaries
- validate API schemas
- check that no secret is hardcoded
- check documentation
- check examples
- verify selective installation
