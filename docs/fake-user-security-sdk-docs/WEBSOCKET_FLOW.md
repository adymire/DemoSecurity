# Real-Time / WebSocket Flow

For desktop applications with long-running AI or agent operations:

```text
Desktop App
   │
   │ prompt
   ▼
Local Brain
   │
   │ WebSocket
   ▼
Backend Gateway
   │
   ├── Loop / Orchestration
   ├── Tool execution
   └── LLM API
           │
           ▼
Desktop App
```

The fake-user security system is a separate cross-cutting service:

```text
Desktop App
   ├── AI WebSocket
   └── Security SDK → Security API
```

Do not mix security telemetry directly into the AI loop.

For long-running loops:

- assign operation IDs
- authenticate WebSocket sessions
- authorize every operation
- enforce quotas
- enforce cancellation
- enforce timeouts
- record security-relevant events
