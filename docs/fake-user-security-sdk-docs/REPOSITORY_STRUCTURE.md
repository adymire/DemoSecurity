# Repository Structure

The repository is intentionally modular so users do not need to clone or ship every platform implementation.

```text
open-fraud-sdk/
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── PRIVACY.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATA_MODEL.md
│   ├── SECURITY_MODEL.md
│   ├── PRIVACY_MODEL.md
│   ├── RISK_ENGINE.md
│   ├── POLICY_ENGINE.md
│   ├── ADMIN.md
│   ├── DEPLOYMENT.md
│   ├── INTEGRATION.md
│   └── PROMPTS/
│       ├── MASTER_PROMPT.md
│       ├── BACKEND_PROMPT.md
│       ├── WEB_PROMPT.md
│       ├── MOBILE_PROMPT.md
│       ├── ADMIN_PROMPT.md
│       └── TESTING_PROMPT.md
│
├── packages/
│   │
│   ├── core-protocol/
│   │   ├── schemas/
│   │   ├── crypto/
│   │   └── transport/
│   │
│   ├── backend/
│   │   ├── node/
│   │   ├── nestjs/
│   │   ├── python/
│   │   ├── php/
│   │   └── go/
│   │
│   ├── web/
│   │   ├── javascript/
│   │   ├── react/
│   │   └── nextjs/
│   │
│   └── mobile/
│       ├── android-java/
│       ├── android-kotlin/
│       ├── flutter/
│       └── react-native/
│
├── services/
│   ├── api-gateway/
│   ├── identity-service/
│   ├── risk-service/
│   ├── event-service/
│   ├── policy-service/
│   ├── restriction-service/
│   ├── notification-service/
│   └── admin-service/
│
├── admin/
│   └── README.md
│
├── examples/
│   ├── react/
│   ├── nextjs/
│   ├── node/
│   ├── python/
│   ├── php/
│   ├── go/
│   ├── flutter/
│   ├── android-kotlin/
│   └── react-native/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── security/
    └── abuse-scenarios/
```

## Selective installation

Example concept:

```bash
git clone <repository>
cd open-fraud-sdk

# Only obtain the Flutter adapter
git sparse-checkout init --cone
git sparse-checkout set packages/core-protocol packages/mobile/flutter examples/flutter docs
```

The actual package manager distribution can later publish individual packages so cloning the whole repository is not required for production.
