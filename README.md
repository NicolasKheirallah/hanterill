# Hanterill

Hanterill is a desktop app for reading diagnostics from supported Volvo, Polestar and related vehicles. Connect a passive ENET cable to the car and an Ethernet port on your computer; the app reads what the car's control units report. Your sessions stay on your computer.

The app runs on Windows, macOS and Linux. It's free for private use under the terms in [LICENSE.md](LICENSE.md). This repository contains the public website and user guides; the desktop app's source tree is private.

## What you can check

- **Battery condition:** State of health and charge, pack voltage, cell-group readings and temperatures. Save sessions to see how readings change on the same car.
- **Faults:** Scan the modules fitted to the car, separate active codes from stored history and inspect any snapshots the control unit supplies. Compare scans before and after a repair.
- **Live readings:** Plot battery, drive-unit and 12 V measurements; save a recording for later review.
- **Vehicle history:** Compare saved firmware inventories, module lists, battery readings and fault scans. Reports can be printed or exported from the data the car supplied.
- **Service actions:** Where the installed build and vehicle support them, clear codes or run a listed routine after a separate confirmation. The car may still refuse a protected action.

The [screen tour](src/content/docs/workspace-tour.mdx) shows where each reading lives. The [reading results guide](src/content/docs/reading-results.mdx) explains missing values, provisional decoders and incomplete scans.

## Vehicle support

Support is checked per vehicle and per function. A working Ethernet connection does not mean every battery reading or service routine has been verified on that model.

| Vehicle family | Current status |
| --- | --- |
| Polestar 2; Volvo XC40 Recharge / EX40 and C40 Recharge / EC40 | CMA is the main tested platform. Battery, fault, module and live-data paths have real-car verification. |
| Volvo XC60, S60, V60, S90, V90 and XC90 | SPA connection, module inventory and fault scans have been exercised on a V90 T6. Hybrid battery reads still need testing on more cars. |
| Volvo EX30; Polestar 4; Zeekr 001 / X / 009 | SEA catalogues and pack layouts are in the app. Direct gateway connection has been verified on a Zeekr 001; other readings remain under test. |
| Lynk & Co 01 / 02 / 05; Volvo EX90; Polestar 3 | Research or partial support, depending on platform. Check the model before using a result. |

See [Supported vehicles](src/content/docs/supported-vehicles.mdx) for model details, status labels and the 10 catalogued battery layouts. On the reference CMA pack, Hanterill can read 108 cell groups across 27 modules. The CMA module catalogue contains 49 entries; a particular car answers only for units fitted to it.

## Connect a car

You need a passive OBD-II to RJ45 ENET cable and a real Ethernet interface, either built into your computer or provided by a USB adapter. ELM327 and other serial OBD dongles cannot carry this DoIP connection. Some SEA vehicles need the ENET cable's activation-pin wiring; check [Hardware and adapters](src/content/docs/hardware-and-adapters.mdx) before buying one.

1. Plug the ENET cable into the car's diagnostic socket and your computer's Ethernet port.
2. Wake the car, then select the wired adapter on Hanterill's **Connection** screen.
3. Choose **Find vehicle** and connect when the car appears. Start with **Run full check** on **Overview**.

The car and computer establish a local Ethernet link. You don't need a router or an internet connection for a diagnostic session. [Getting started](src/content/docs/getting-started.mdx) walks through the first scan, and [Troubleshooting](src/content/docs/troubleshooting.mdx) covers a car that does not appear.

Released builds require a supported car. The interactive examples on the website use fixed sample data; the downloadable app has no demo vehicle mode.

## Protocols and limits

Hanterill uses Diagnostics over Internet Protocol (DoIP, ISO 13400) to reach the gateway and Unified Diagnostic Services (UDS, ISO 14229) to ask control units for readings. The app's screens use the Ethernet link. The car also has internal CAN networks, but you do not need a separate CAN adapter to use Hanterill. The [protocol guide](src/content/docs/architecture.mdx) explains that path and its limits.

Ordinary scans read information. Clearing codes, resetting a unit and running a service routine can change the car; each action has its own confirmation, and some routines are still in beta or may be blocked by the car. Read the [service guide](src/content/docs/service-functions.mdx) and [safety guide](src/content/docs/safety.mdx) before using them. A diagnostic cable does not make physical work on high-voltage equipment safe.

## Downloads, privacy and terms

Choose the package for your operating system on the [download page](https://hanterill.com/en/download). The [installation guide](src/content/docs/installation.mdx) covers first-launch prompts. Tagged releases and their checksums are published on [GitHub Releases](https://github.com/NicolasKheirallah/hanterill/releases).

Hanterill does not require an account or upload diagnostic sessions. Review exports before sharing them, especially if you choose to include a VIN or location. The [privacy guide](src/content/docs/privacy.mdx) explains what stays on disk and how identifiers are handled.

Hanterill is independent of Volvo Cars, Polestar and Geely. Manufacturer names describe compatibility, not endorsement. The source is available to read under [CC BY-NC-ND 4.0](LICENSE.md); it is not OSI open source. For a shorter explanation, see the [license guide](src/content/docs/license.mdx).
