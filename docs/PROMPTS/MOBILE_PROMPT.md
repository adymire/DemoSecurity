# Mobile SDK Prompt

Implement separate adapters for:

- Android XML + Java
- Android Kotlin + Jetpack
- Flutter
- React Native

Do not combine their source trees.

Each adapter should expose equivalent concepts:

```text
initialize()
registerInstallation()
identifyUser()
recordEvent()
evaluate()
getRestriction()
```

Use native platform APIs only where necessary.

Do not collect restricted/private device data without a valid platform-supported mechanism and documented purpose.

Do not place backend secrets in mobile applications.
