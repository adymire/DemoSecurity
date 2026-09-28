# Admin System

The SDK can expose security data to an application's existing admin panel.

## User view

Show:

- user ID
- masked email
- auth provider
- account creation date
- installations
- last login
- risk level
- recent security events
- active restrictions
- plan/usage if the host application provides billing data

## Device / installation view

Show:

- installation ID
- platform
- app version
- first seen
- last seen
- linked account count
- risk signals

## Actions

Admin can:

- restrict
- temporarily block
- permanently block
- remove restriction
- add trusted installation
- review security events
- update risk policy

Every action must create an audit log.

## Alerts / announcements

The host application may use the same admin system for:

- platform announcements
- payment/plan updates
- security notices
- maintenance messages

Announcements are separate from the fraud engine and should not alter risk decisions automatically.
