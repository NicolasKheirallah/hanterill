# Security policy

Hanterill opens a raw network socket to a vehicle's diagnostic gateway. That is
an unusual position for a desktop application, and it is the reason this file
exists rather than a paragraph in the README.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private reporting: go to
[github.com/NicolasKheirallah/hanterill/security/advisories/new](https://github.com/NicolasKheirallah/hanterill/security/advisories/new)
and file a draft advisory. If you cannot use that, email the address on the
author's GitHub profile with `HANTERILL SECURITY` in the subject line.

Please include:

- What the issue is and where it lives (file, protocol layer, or interface).
- The smallest reproduction you can manage.
- What an attacker gains, and what they need in order to try it.
- Whether it affects a released build or only a development configuration.

You will get an acknowledgement within a few days. This is a single-maintainer
project, so there is no paid bounty and no formal SLA — but every report is read
and answered, and credit is given in the fix's release notes unless you ask
otherwise.

## What is in scope

- The desktop application and its CLI.
- The DoIP/UDS transport, the decoders, and the session archive format.
- The capability manifest and the write-confirmation model.
- This website and its build pipeline.

## What is not in scope

- Physical access to an unlocked vehicle. If someone can plug a cable into the
  OBD-II port, they are already past every boundary Hanterill draws.
- The vehicle's own gateway firmware. Report those to the manufacturer.
- Anything that requires the user to run a build they compiled themselves with
  the write surface deliberately stripped or altered.

## The boundaries the design already draws

These are intentional, and a report that they are *absent* is not a
vulnerability — a report that they can be *bypassed* is.

- **Reads are the default path and never prompt.** Clearing (`0x14`), starting
  service routines (`0x31`) and ECU reset (`0x11`) each require a separate,
  explicit confirmation. There is no bulk "allow writes" switch.
- **No module flashing. No security access (`0x27`) to write by identifier. No
  programming services.** Those are not implemented at all, in any build.
- **The write surface is advertised, not assumed.** The running binary publishes
  a capability manifest and the interface offers only what it reports.
- **Nothing leaves the machine.** No backend, no account, no analytics, no crash
  telemetry, no update ping. Session archives, caches and exports are written
  locally. VINs are redacted in exports and support bundles; serials, private
  addresses and GPS coordinates are scrubbed.
- **One connection at a time**, cancellable per operation, with a single live
  stream guard.

## Supported versions

Security fixes land on the latest tagged release. Older tags are not
back-ported; the app is small enough that upgrading is the supported path.

| Version | Supported |
| --- | --- |
| Latest tag | Yes |
| Any earlier tag | No |
