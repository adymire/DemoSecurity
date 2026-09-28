# Risk Engine

The engine correlates multiple signals instead of using one signal as a verdict.

## Example signal groups

### Identity

- same verified account
- same authentication provider
- account age
- email-domain reputation

### Device / installation

- same installation
- device-risk identifier reuse
- repeated installations
- app version anomalies

### Network

- server-observed IP history
- rapid IP changes
- high account concentration from one network
- suspicious proxy/VPN indicators where legally and technically appropriate

### Behaviour

- signup velocity
- login velocity
- repeated failed actions
- spam-like request frequency
- repeated free-credit consumption
- automation indicators

## Decision model

Use configurable weighted signals:

```text
riskScore =
  identityRisk
+ deviceRisk
+ networkRisk
+ velocityRisk
+ behaviourRisk
```

The exact weights must be configurable by the application.

## Do not do this

```text
same IP => fraud
same device => fraud
same country => fraud
```

These create false positives.

## Better model

```text
multiple correlated signals
        ↓
risk score
        ↓
policy thresholds
        ↓
action
```

The system should record the reason codes that contributed to a decision.
