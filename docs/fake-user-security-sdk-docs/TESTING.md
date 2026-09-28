# Testing

## Unit tests

Test:

- signal normalization
- risk scoring
- policy thresholds
- restriction expiration
- account correlation
- event validation

## Integration tests

Test:

- signup
- login
- OAuth callback
- installation registration
- risk evaluation
- temporary block
- permanent block
- admin actions

## Abuse scenarios

### Scenario 1: Normal user

```text
1 account + 1 device + normal requests
→ allow
```

### Scenario 2: Multiple accounts

```text
new accounts + correlated installation + rapid free usage
→ elevated risk
```

### Scenario 3: Same IP, different legitimate users

```text
same public IP
different devices
normal behaviour
→ do not automatically block
```

### Scenario 4: VPN / network change

```text
same user
different IP
same installation
normal behaviour
→ do not automatically block
```

### Scenario 5: Automated signup

```text
high signup velocity
+ repeated device/network correlation
+ automation indicators
→ challenge/restrict according to policy
```

## Security testing

Include:

- replay tests
- token tampering
- rate-limit tests
- authorization bypass tests
- event spoofing tests
- admin privilege tests
- injection tests
