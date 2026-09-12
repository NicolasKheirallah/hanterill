# Hanterill

> **Source-available, dealer-grade vehicle diagnostics & high-voltage telemetry for Polestar and Volvo electric vehicles over DoIP/UDS.**

This repository is the **public website** (`hanterill.org`): a static Next.js export describing the app, its verified vehicle support and its safety boundaries. Tagged releases are published at [NicolasKheirallah/hanterill](https://github.com/NicolasKheirallah/hanterill); the application's source tree is private. Everything below documents what the app supports today, kept in sync with its changelog.

[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC_BY--NC--ND_4.0-lightgrey.svg)](LICENSE.md)
[![Platform: macOS · Windows · Linux](https://img.shields.io/badge/Platform-macOS_%7C_Windows_%7C_Linux-lightgrey.svg)](https://hanterill.org/en/download)
[![Rust: 1.88+](https://img.shields.io/badge/Rust-1.88%2B-orange.svg)](https://www.rust-lang.org)
[![Tauri: v2](https://img.shields.io/badge/Tauri-v2-24C8D8.svg)](https://tauri.app)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25_Local-brightgreen.svg)](https://hanterill.org/en/privacy)

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Supported Vehicles & Platforms](#supported-vehicles--platforms)
3. [Supported ECUs & Subsystems](#supported-ecus--subsystems)
4. [Supported Diagnostic Protocols & Services](#supported-diagnostic-protocols--services)
5. [What You Can Do With Hanterill](#what-you-can-do-with-hanterill)
6. [Supported Hardware & Adapters](#supported-hardware--adapters)
7. [Operating System Support](#operating-system-support)
8. [Step-by-Step Connection Guide](#step-by-step-connection-guide)
9. [Installation & Getting Started](#installation--getting-started)
10. [User Interface & Theming](#user-interface--theming)
11. [Workspace Architecture](#workspace-architecture)
12. [Safety, Privacy & Data Ownership](#safety-privacy--data-ownership)
13. [Disclaimer & Legal Notice](#disclaimer--legal-notice)

---

## About the Project

**Author:** Nicolas Kheirallah

Modern electric vehicles built on Geely/Volvo's **Compact Modular Architecture (CMA)**, **SPA** and **SEA (Sustainable Experience Architecture)** communicate over high-speed Ethernet using standard automotive **Diagnostics over Internet Protocol (DoIP, ISO 13400)** protocols. However, accessing high-voltage battery health, live cell potentials, thermal sensors, or module fault codes has traditionally required expensive proprietary dealer subscriptions (such as VIDA), closed commercial scan tools, or cloud logins.

**Hanterill** solves this. It is a free, fully local, source-available desktop diagnostic application that talks directly to your car over a standard Ethernet cable, decoding raw vehicle network traffic into readable diagnostic telemetry. It is licensed for personal, non-commercial use only.

---

## Supported Vehicles & Platforms

Hanterill is built around the Geely/Volvo architecture families, with a per-vehicle verification status. Reading the table: *Verified* means exercised against a live reference vehicle; *Catalogued* means the ECU registry, identifiers and decoders ship but are pending hardware confirmation; *Research* means the platform is being investigated.

| Vehicle | Platform | Model Years | Supported Powertrains | Verification status |
| :--- | :--- | :--- | :--- | :--- |
| **Polestar 2** | CMA | 2021 – Present | Standard Range Single Motor, Long Range Single Motor (FWD & RWD), Long Range Dual Motor (AWD), Performance Pack | Verified (reference vehicle) |
| **Volvo EX40 / XC40 Recharge** | CMA | 2021 – Present | Single Motor (FWD & RWD), Twin Motor (AWD) | Verified |
| **Volvo EC40 / C40 Recharge** | CMA | 2022 – Present | Single Motor, Twin Motor (AWD) | Verified |
| **Volvo EX30** | SEA1 | 2024 – Present | Single Motor, Twin Motor Performance | Catalogued (107S/110S topologies), hardware confirmation pending |
| **Polestar 4** | SEA1 | 2024 – Present | Single Motor, Dual Motor | Catalogued, hardware confirmation pending |
| **Zeekr 001 / X / 009** | SEA | 2021 – Present | Single Motor RWD, Dual Motor AWD | Research; does not inherit the EX30 map |
| **Lynk & Co 01 / 02 / 05** | CMA | 2020 – Present | Primarily PHEV (EM-P) | Research; hybrid pack layout unverified |
| **Volvo XC60 / S60 / V60 / S90 / V90 / XC90 Recharge** | SPA | 2016 – Present | T8 plug-in hybrid (102-cell pack) | Catalogued (CAN-era BECM map and decoders), live verification pending |
| **Volvo EX90 / Polestar 3** | SPA2 | 2024 – Present | Single & Dual Motor | Research; different gateway and security model |

Multi-architecture support is a first-class design (ADR 0008): platform auto-detection, per-architecture ECU registries, and pack topologies as data, not code.

---

## Supported ECUs & Subsystems

Hanterill maps and probes up to **43 Electronic Control Units (ECUs)** communicating across high-speed Ethernet and gateway bridges:

```
                      [ Physical Ethernet Port (ENET) ]
                                      │
                                      ▼
                        Central Electronic Module (CEM)
                                [ Master Gateway ]
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
High-Voltage / Energy          Chassis & Drive                Safety, Body & Cabin
├─ BECM (BMS)                 ├─ BCM2 (Brakes/EPB)         ├─ CCM (Climate)
├─ VCU1 (Drive Ctrl)          ├─ SAS (Steering Angle)      ├─ DIM (Driver Cluster)
├─ OBC (On-Board Chg)         ├─ PSCM (Pwr Steering)       ├─ TCAM (Telematics/LTE)
├─ IHFA (Front Inv)           ├─ FLR (Forward Radar)       ├─ SRS (Airbag / Safety)
└─ IEM (ERAD Inv)             └─ WAM (Wide-Angle Cam)      └─ POT (Power Tailgate)
```

- **CEM (Central Electronic Module)**: Master security gateway, 12V low-voltage power distribution, sleep manager.
- **BECM (Battery Energy Control Module)**: Traction battery BMS, 27 modules × 4 series cell groups (108 potentials), pack temperature channels, State of Health (SoH), State of Charge (SoC), contactor status.
- **BCM2 (Brake Control Module 2)**: Integrated Power Brake (IPB), ABS, Stability Control, Electric Parking Brake (EPB) calipers.
- **VCU1 (Vehicle Control Unit)**: Drive coordination and torque delivery for the front and rear permanent magnet synchronous motors. The inverters themselves are addressed separately as IHFA (front axle) and IEM (rear/ERAD).
- **TCAM (Telematics & Connectivity Antenna Module)**: LTE modem, GNSS positioning, emergency backup battery, Bluetooth key transceiver.
- **ASDM (Active Safety Domain Master)**: Pilot Assist forward camera, emergency collision avoidance, radar/vision fusion.
- **CCM (Climate Control Module)**: Heat pump thermal loop, PTC cabin heater, 8 blend door damper actuators, A/C compressor.
- **DIM (Driver Information Module)**: 12.3-inch driver instrument cluster, Service Reminder Indicator (SRI), odometer sync.

---

## Supported Diagnostic Protocols & Services

Hanterill implements the full automotive open networking stack:

| Protocol / Standard | Specification | Function in Hanterill |
| :--- | :--- | :--- |
| **ISO 13400-2 (DoIP)** | Diagnostics over Internet Protocol | Auto-discovers vehicles over UDP/TCP Port 13400, negotiates vehicle announcements, handles routing activation, functional broadcast addressing, keepalive pinging. |
| **ISO 14229-1 (UDS)** | Unified Diagnostic Services | Standardized diagnostic messaging layer running inside DoIP frames. |
| **UDS 0x10** | `DiagnosticSessionControl` | Switches target ECUs between Default, Extended Diagnostic, and Safety sessions. |
| **UDS 0x14** | `ClearDiagnosticInformation` | Erases trouble codes per module or car-wide, with freeze-frame backup and verify re-read. Compiled out of released builds (`unsafe-write-ops` only). |
| **UDS 0x19** | `ReadDTCInformation` | Sub-functions for DTC counts by status mask, the DTC list, snapshot records and extended data records drive freeze-frame triage. |
| **UDS 0x22** | `ReadDataByIdentifier` | Reads high-resolution telemetry, BMS cell arrays, thermal matrices, VIN, and part numbers. |
| **UDS 0x2A** | `ReadDataByPeriodicIdentifier` | On-demand periodic sampling for live views (send-once registration and teardown only in read-only builds). |
| **UDS 0x31** | `RoutineControl` | Requests stored routine results in read-only builds. Starting routines (EPB retract, damper calibration) is compiled out (`unsafe-write-ops` only). |
| **UDS 0x3E** | `TesterPresent` | Keeps modules awake through long sweeps; transparent to the user. |
| **SAE J2012 / ISO 14229-1** | DTC definition and status bytes | Decodes codes such as `P0A80-00` with the full byte-level status mask, classified into the four states the interface shows: active, pending, stored, historical. |

---

## What You Can Do With Hanterill

### 1. Traction Battery Health & Degradation Check
- **True State of Health (SoH)**: Read the exact BMS battery degradation percentage directly from the BECM, without guesswork.
- **Full Cell-Group Breakdown**: Visualize every series cell-group voltage (27 modules × 4 groups = 108 potentials on CMA), read from the governed BMS identifier range, with imbalance highlighting to catch weak or degraded groups before they cause battery failure. The matrix adapts to the pack topology in force: SPA EV 96S/108S, SPA hybrid 102S and SEA 107S/110S are catalogued, and a 102-cell pack reports complete at 102.
- **Thermal Grid & Cross-Checks**: Pack temperature channels rendered as a thermal grid, plus ten cross-signal consistency checks (reported pack voltage against the cell sum, parked current plausibility, coolant loop deltas). Sensor-to-module placement is not yet established, and the per-module temperature blocks read as unsupported on the reference vehicle.

### 2. Full-Vehicle Fault Code (DTC) Triage
- Scan the full 43-ECU catalogue in one pass over high-speed DoIP, accelerated by functional broadcast collection and per-vehicle presence caching. 34 of those ECUs advertise DTC support.
- Distinguish between **Active** faults (currently causing warning lights) and **Stored** historical faults (transient events). The inspector opens on a "Needs Attention" view.
- Inspect **Freeze-Frame Telemetry** (vehicle speed, low-voltage rail, pack temperature, inverter torque) captured at the exact second the fault was tripped.
- Compare **DTC Snapshots** before and after repairs with the built-in diff viewer.

### 3. DIY Maintenance & Service Procedures
> [!WARNING]
> The operations below are compiled out of released builds. They exist only in software deliberately built with the `unsafe-write-ops` feature, and the runtime capability manifest reports the difference. See [docs/safety.md](docs/safety.md).
- **DTC Clearing (reference parity)**: car-wide or per-module erase with freeze-frame backup before the wipe, a verify re-read that reports the stubborn set, link recovery after module reboots, and an optional force-reset loop (suppressed while the car is in a driving mode).
- **EPB Service Mode**: Retract the rear electric parking brake calipers into service position to perform rear brake pad/rotor replacements safely. Clamp and re-calibrate pad travel when finished.
- **12V Battery Adaptation Reset**: Re-learn the 12V battery SoC and capacity aging matrix in the CEM after replacing the AGM low-voltage battery.
- **Service Reminder Indicator (SRI) Reset**: Clear the "Regular maintenance required" message and reset the service due countdown timer.
- **HVAC Damper Calibration**: Cycle and re-learn endstop limits for all 8 climate blend door motors.
- **Panoramic Sunroof Normalization**: Reset anti-pinch travel bounds for panoramic glass roof shades and windows.

### 4. 12V Parasitic Sleep Drain Analysis
- Diagnose mysterious 12V battery drain and TCAM deep sleep failures.
- View quiescent standby current histograms and module wake-state logs.

### 5. Live Telemetry Waveforms & CSV Export
- Stream and chart high-frequency drivetrain, inverter, and battery PIDs, using UDS periodic sampling with gap and rate accounting.
- Export all reports (Vehicle Summary, Cell-Group Potentials, DTC Records, ECU Inventory) to standard **CSV** and **JSON** files with one click.

### 6. Pre-Purchase Inspection (PPI) Report
- A scored vehicle-condition grade (rules v1.0.0) covering pack degradation, cell balance, DTC severity and odometer consistency.
- Every rule cites its evidence class, and the class caps the verdict it can force. Missing inputs degrade the grade toward inconclusive; they never pass silently.
- Stored sessions re-score under current rules without reconnecting to the vehicle. Reports print natively; GPS position never appears in them.

### 7. Session Archive, Diffs & Offline Intelligence
- Durable local session store with operator notes, corrupt-file recovery and pick-two comparison across DTC, battery, ECU and firmware domains (cell history and firmware session diffs included).
- An all-module bounded DID scanner sweeps the catalogue with per-row negative-response codes, digests and latency; the DID Explorer replays saved captures offline against a learned per-ECU applicability cache.
- Multi-ECU odometer cross-checks, TCAM backup-battery health, steering angle state, service schedule countdowns, on-request GNSS fix, the 256-entry CEM option map and the factory build record (paint, trim and option codes) each have their own read view.

### 8. Work Without a Car
- Deterministic simulation vehicles on the connection page (healthy baseline, fault-injected, sleep-drain) exercise every screen offline, always labelled as simulated.

---

## Supported Hardware & Adapters

Hanterill connects over standard wired Ethernet. It does not use OBD dongles like OBDLink or ELM327: CAN-based adapters lack the bandwidth DoIP needs.

```
[ Car Diagnostic Port ] ──▶ [ OBD-II to RJ45 (ENET) Cable ] ──▶ [ USB-C / RJ45 Adapter ] ──▶ [ Your Computer ]
```

### Compatible Cables
- Any passive **OBD-II to Ethernet (ENET) cable** (often labeled as *"BMW ENET Cable"* or *"ISTA / E-Sys ENET Cable"*). These are inexpensive, passive copper cables with no active electronics or drivers required.

### Compatible USB-C / Network Adapters
- Apple USB-C to Gigabit Ethernet Adapter
- Belkin, Anker, UGREEN, Dell, Lenovo, and generic Realtek/ASIX USB-C / Thunderbolt Ethernet dongles
- Built-in RJ45 Ethernet ports on laptops or desktop PCs

---

## Operating System Support

Hanterill is built with Rust and Tauri v2, providing lightweight, native performance across desktop platforms:

| Platform | Architecture | Status | Binary Package |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (M1/M2/M3/M4) & Intel (x86_64) | Fully Supported | `.dmg`, `.app` |
| **Windows** | Windows 10 & 11 (64-bit x64 & ARM64) | Fully Supported | `.msi`, `.exe` installer |
| **Linux** | Ubuntu, Debian, Fedora, Arch (x86_64 & aarch64) | Fully Supported | `.deb`, `.AppImage`, `.tar.gz` |

---

## Step-by-Step Connection Guide

1. **Locate the OBD-II Port**: Under the dashboard on the driver's side (near the hood release latch).
2. **Plug In Cable**: Connect the OBD-II end of your ENET cable to the vehicle, and the Ethernet / USB-C end to your computer.
3. **Turn On Ignition**: Sit in the driver's seat or press the brake pedal to wake the vehicle's Central Electronic Module (CEM).
4. **Automatic Addressing**: DoIP uses link-local networking. Your adapter self-assigns an address in the `169.254.x.x` range the same way the vehicle's gateway does; no DHCP server and no manual IP configuration is required.
5. **Launch Hanterill**: Open the desktop app. It will automatically detect your active Ethernet interface, negotiate DoIP routing activation on Port 13400, and show **Connected (DoIP)**.

> [!TIP]
> **No car available?** Hanterill includes **Deterministic Simulation Targets** built into the connection page. You can launch full simulated vehicle sessions (Baseline Healthy, Fault-Injected DTC Target, or Quiescent Sleep Drain) to explore every screen offline.

---

## Installation & Getting Started

### Pre-Built Desktop Application
Download the latest release for your operating system from the [Releases](https://github.com/NicolasKheirallah/hanterill/releases) page.

> [!NOTE]
> Building from source is not a supported installation path yet. The source is published so it can be read, audited and verified against what the shipped app claims; packaged releases are the supported way to run Hanterill.

---

## User Interface & Theming

Hanterill's interface is deliberately plain: a Scandinavian-adjacent technical style, precise and low on visual clutter.

- **Neutral Reference**: Clean monochrome slate. Hairline rules, square corners, a single restrained accent, Archivo-class system typography.
- **Anti-AI Design**: No consumer emojis. 16 custom stroke-based SVG icons and a compact 48px titlebar.
- **Themes & Density**: Dark, light and high-contrast schemes with verified contrast ratios, plus a comfortable/compact density choice.
- **Languages**: Interface localized to English, Swedish, Norwegian (Bokmål), Danish, Finnish and Icelandic.
- **Accessibility**: WCAG 2.1 AA held by automated regression tests on every state primitive.
- **Keyboard Shortcuts**:
  - `⌘K` / `Ctrl+K`: Global Command Palette.
  - `G O`, `G C`, `G B`, `G M`, `G E`, `G D`, `G L`, `G S`, `G ,`: Fast 2-key navigation chords.
  - `?`: Keyboard shortcuts modal.

---

## Workspace Architecture

The Hanterill codebase is organized as a modular Rust & TypeScript monorepo:

```
hanterill/
├── apps/
│   └── desktop/
│       ├── src-tauri/         # Tauri v2 native application runtime & IPC commands
│       └── ui/                # React 19, Vite 8, Vitest diagnostic frontend suite
├── crates/
│   ├── application/           # High-level diagnostic use cases, contracts, & session engine
│   ├── cma/                   # CMA, SPA & SEA1 platform definitions (ECU catalogues, DIDs, decoders, topologies)
│   ├── transport/             # ISO 13400 (DoIP) and ISO 14229 (UDS) protocol implementations
│   ├── uds_dtc/               # SAE J2012 / ISO 14229 DTC status-byte decoding
│   ├── storage/               # Diagnostic session evidence store
│   ├── cli/                   # Command-line tool (hanterill)
│   └── ffi/                   # UniFFI cross-platform bindings
└── docs/                      # Technical specifications, platform guides, & safety rules
```

---

## Safety, Privacy & Data Ownership

- **Read-Only Safety Boundaries**: Released builds transmit only read-only UDS services (`0x10`, `0x19`, `0x22`, `0x2A`, `0x3E`, plus the routine-result carve-out of `0x31`). Destructive clearing (`0x14`), routine starts and ECU reset (`0x11`) fail closed: they are compiled out unless deliberately built with `--features unsafe-write-ops` (`SAFE-001`, `DTC-002`).
- **100% Local & Private**: Hanterill contains zero analytics, zero crash telemetry, and zero cloud dependencies. Diagnostic sessions and activity logs are stored locally with automated 17-character VIN redaction, support bundles scrubbed of serials, private addresses and GPS coordinates, per-vehicle caches keyed by a hash of the VIN, and no position data in inspection reports (`PRIVACY.md`, `EXPORT-001`).
- **Shipped Capabilities Manifest**: the verified runtime capability and safety boundaries matrix lives at `docs/product/capabilities.md` in the source tree (`DOCS-001`).
- **Privacy Policy**: `PRIVACY.md` in the source tree documents the Zero-Telemetry data ownership policy, storage locations, VIN redaction rules, and retention controls.
- **Safety Guidelines**: `docs/safety.md` in the source tree covers read-only diagnostic boundaries and high-voltage safety notices.

---

## Disclaimer & Legal Notice

Hanterill is an independent, source-available diagnostic project developed by the community. It is **not** affiliated with, authorized by, maintained by, or in any way officially connected with **Polestar Performance AB**, **Volvo Car Corporation**, **Geely Automobile Holdings**, or any of their subsidiaries or affiliates.

> [!WARNING]
> Electric vehicles contain high-voltage systems (400V/800V) capable of causing serious injury or death. Service routines physically actuate vehicle mechanical systems. Always follow the safety precautions documented in `DISCLAIMER.md` in the source tree before connecting to or servicing any vehicle.

All product names, logos, brands, and vehicle models are trademarks or registered trademarks of their respective holders.

For the full legal disclaimer, warranty limitations, and automotive safety notices, see **`DISCLAIMER.md`** in the source tree.

**Private use only.** Hanterill is licensed **CC BY-NC-ND 4.0**: read, run and share it for personal, non-commercial use, with no commercial use and no distributing modified versions. The source is available to read; it is not OSI open source. See [LICENSE.md](LICENSE.md) for the full terms.
