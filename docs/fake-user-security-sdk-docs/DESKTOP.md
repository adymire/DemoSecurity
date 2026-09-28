# Desktop Integration

Supported target:

- Windows
- macOS
- Linux

## Security

A desktop app is a client and therefore untrusted.

Use:

- signed installers
- secure auto-update
- OS keychain/credential store
- short-lived access tokens
- refresh-token rotation
- server-side authorization
- encrypted local state

## Installer

The installer should:

1. install the application
2. register required local components
3. initialize secure local storage
4. create an installation identity
5. authenticate the user
6. register the installation with the backend

## Local chats

AI/Coding/Agent chats can remain local for a desktop-first release.

The security SDK should only send the minimum security telemetry required for abuse prevention.

Do not upload private chat content to the fraud service unless a separate product requirement explicitly requires it.
