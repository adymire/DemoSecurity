# Backend Prompt

Implement the backend foundation for the open fraud-detection SDK.

Requirements:

- REST API first
- modular architecture
- authentication and authorization
- request validation
- rate limiting
- event ingestion
- risk evaluation
- policy engine
- restrictions
- admin audit log
- Redis
- asynchronous event queue
- database adapter
- OpenAPI documentation
- structured logging
- request IDs

The backend must derive authoritative IP/network metadata from the request.

Do not trust client-submitted risk scores.

Provide environment variables for:

- database
- Redis
- queue
- JWT/session configuration
- encryption keys
- app IDs

Never hardcode production credentials.
