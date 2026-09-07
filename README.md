# Hanterill

> **Source-available, dealer-grade vehicle diagnostics & high-voltage telemetry for Polestar and Volvo electric vehicles over DoIP/UDS.**

[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC_BY--NC--ND_4.0-lightgrey.svg)](LICENSE.md)
[![Platform: macOS · Windows · Linux](https://img.shields.io/badge/Platform-macOS_%7C_Windows_%7C_Linux-lightgrey.svg)](docs/platform/macos.md)
[![Rust: 1.92+](https://img.shields.io/badge/Rust-1.92%2B-orange.svg)](https://www.rust-lang.org)
[![Tauri: v2](https://img.shields.io/badge/Tauri-v2-24C8D8.svg)](https://tauri.app)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25_Local-brightgreen.svg)](docs/privacy.md)

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

Modern electric vehicles built on Geely/Volvo's **Compact Modular Architecture (CMA)** and **Scalable Product Architecture (SPA2)** communicate over high-speed Ethernet using standard automotive **Diagnostic over IP (DoIP)** protocols. However, accessing high-voltage battery health, live cell potentials, thermal sensors, or module fault codes has traditionally required expensive proprietary dealer subscriptions (such as VIDA), closed commercial scan tools, or cloud logins.

**Hanterill** solves this. It is a free, fully local, source-available desktop diagnostic application that talks directly to your car over a standard Ethernet cable, decoding raw vehicle network traffic into readable diagnostic telemetry. It is licensed for personal, non-commercial use only.

---

## Supported Vehicles & Platforms

Hanterill supports all electric and hybrid vehicles built on the **CMA** (Compact Modular Architecture) and **SPA2** platforms:

| Vehicle | Model Years | Supported Powertrains |
| :--- | :--- | :--- |
| **Polestar 2** | 2021 – Present | Standard Range Single Motor, Long Range Single Motor (FWD & RWD), Long Range Dual Motor (AWD), Performance Pack |
| **Volvo EX40 / XC40 Recharge** | 2021 – Present | Single Motor (FWD & RWD), Twin Motor (AWD) |
| **Volvo EC40 / C40 Recharge** | 2022 – Present | Single Motor, Twin Motor (AWD) |
| **Volvo EX30** *(Early DoIP)* | 2024 – Present | Single Motor, Twin Motor Performance |
| **Zeekr 001 / X / 009** *(CMA/SEA)* | 2022 – Present | Single Motor RWD, Dual Motor AWD |
| **Lynk & Co 01 / 02 / 05** | 2020 – Present | PHEV & BEV variants |

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
| **ISO 13400-2 (DoIP)** | Diagnostic over IP | Auto-discovers vehicles over UDP/TCP Port 13400, negotiates vehicle announcements, handles routing activation, keepalive pinging. |
| **ISO 14229-1 (UDS)** | Unified Diagnostic Services | Standardized diagnostic messaging layer running inside DoIP frames. |
| **UDS 0x10** | `DiagnosticSessionControl` | Switches target ECUs between Default, Extended Diagnostic, and Safety sessions. |
| **UDS 0x14** | `ClearDiagnosticInformation` | Safely requests master gateways and ECUs to erase cleared trouble codes. |
| **UDS 0x19** | `ReadDTCInformation` | Sub-functions `0x02` (ReportByStatusMask) and `0x04` (ReportDTCSnapshotRecordByDTCNumber) for freeze-frame triage. |
| **UDS 0x22** | `ReadDataByIdentifier` | Reads high-resolution telemetry, BMS cell arrays, thermal matrices, VIN, and part numbers. |
| **UDS 0x31** | `RoutineControl` | Executes non-gated vehicle service routines (EPB retract, damper calibration, BMS reset). |
| **SAE J2012** | Diagnostic Trouble Code Standard | Decodes 7-character DTCs with full byte-level status bitmasks (`Active`, `Pending`, `Stored Historical`, `Warning Indicator Requested`). |

---

## What You Can Do With Hanterill

### 1. Traction Battery Health & Degradation Check
- **True State of Health (SoH)**: Read the exact BMS battery degradation percentage directly from the BECM, without guesswork.
- **108-Potential Cell Breakdown**: Visualize all 108 series cell-group voltages (27 modules × 4 groups), read from the governed BMS identifier range. Highlight groups with >25 mV delta imbalance to catch weak or degraded cell groups before they cause battery failure.
- **Pack Thermal Channels** *(provisional)*: Monitor the three pack temperature channels to detect cooling channel restrictions or thermal gradient anomalies. Sensor-to-module placement is not yet established, and the per-module temperature blocks read as unsupported on the reference vehicle.

### 2. Full-Vehicle Fault Code (DTC) Triage
- Scan the full 43-ECU catalogue in under 5 seconds over high-speed DoIP. 34 of those ECUs advertise DTC support.
- Distinguish between **Active** faults (currently causing warning lights) and **Stored** historical faults (transient events).
- Inspect **Freeze-Frame Telemetry** (vehicle speed, low-voltage rail, pack temperature, inverter torque) captured at the exact second the fault was tripped.
- Compare **DTC Snapshots** before and after repairs with the built-in diff viewer.

### 3. DIY Maintenance & Service Procedures
- **EPB Service Mode**: Retract the rear electric parking brake calipers into service position to perform rear brake pad/rotor replacements safely. Clamp and re-calibrate pad travel when finished.
- **12V Battery Adaptation Reset**: Re-learn the 12V battery SoC and capacity aging matrix in the CEM after replacing the AGM low-voltage battery.
- **Service Reminder Indicator (SRI) Reset**: Clear the "Regular maintenance required" message and reset the service due countdown timer.
- **HVAC Damper Calibration**: Cycle and re-learn endstop limits for all 8 climate blend door motors.
- **Panoramic Sunroof Normalization**: Reset anti-pinch travel bounds for panoramic glass roof shades and windows.

### 4. 12V Parasitic Sleep Drain Analysis
- Diagnose mysterious 12V battery drain and TCAM deep sleep failures.
- View quiescent standby current histograms and module wake-state logs.

### 5. Live Telemetry Waveforms & CSV Export
- Stream and chart high-frequency drivetrain, inverter, and battery PIDs.
- Export all reports (Vehicle Summary, Cell-Group Potentials, DTC Records, ECU Inventory) to standard **CSV** and **JSON** files with one click.

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
4. **Auto IP Configuration**: The vehicle's DoIP gateway will assign your computer a link-local address in the `169.254.x.x` subnet. No manual IP configuration is required.
5. **Launch Hanterill**: Open the desktop app. It will automatically detect your active Ethernet interface, negotiate DoIP routing activation on Port 13400, and show **Connected (DoIP)**.

> [!TIP]
> **No car available?** Hanterill includes **Deterministic Simulation Targets** built into the connection page. You can launch full simulated vehicle sessions (Baseline Healthy, Fault-Injected DTC Target, or Quiescent Sleep Drain) to explore every screen offline.

---

## Installation & Getting Started

### Option A: Pre-Built Desktop Application (Recommended)
Download the latest pre-compiled binary for your operating system from the [Releases](https://github.com/nicolaskheirallah/Hanterill-main/releases) page.

### Option B: Building from Source (One-Click Desktop App)

#### Prerequisites
- [Rust 1.92+](https://www.rust-lang.org/tools/install)
- [Node.js 22+](https://nodejs.org) and npm

```sh
# 1. Clone the repository
git clone https://github.com/nicolaskheirallah/Hanterill-main.git
cd Hanterill-main

# 2. Build and launch the native app (one command)
scripts/release/build-desktop.sh
#   add --dmg        to also produce a macOS .dmg
#   add --no-launch  to build without launching
#   add --debug      for a faster debug build
```

The script produces a double-clickable native bundle and launches it:

| Platform | Artifact |
| :--- | :--- |
| **macOS** | `apps/desktop/src-tauri/target/release/bundle/macos/Hanterill.app` (ad-hoc signed; first launch: right-click → *Open*, or `xattr -cr Hanterill.app`) |
| **Linux** | `.../bundle/appimage/Hanterill_*.AppImage` + `.deb` |
| **Windows** | `.../bundle/nsis/Hanterill_*-setup.exe` installer |

Useful npm equivalents (run inside `apps/desktop/ui`): `npm run app:dev`
(live-reload desktop shell) and `npm run app:build` (same bundle).

### Option C: Web Preview (Dev Mode)
To inspect the interface directly in your web browser with the embedded CMA vehicle simulator:

```sh
cd apps/desktop/ui
npm install
npm run dev
# Open http://localhost:5173
```

---

## User Interface & Theming

Hanterill's interface is deliberately plain: a Scandinavian-adjacent technical style, precise and low on visual clutter.

- **Neutral Reference**: Clean monochrome slate. Hairline rules, square corners, a single restrained accent, Archivo-class system typography.
- **Anti-AI Design**: No consumer emojis. 16 custom stroke-based SVG icons and a compact 48px titlebar.
- **Keyboard Shortcuts**:
  - `⌘K` / `Ctrl+K`: Global Command Palette.
  - `G O`, `G C`, `G B`, `G M`, `G E`, `G D`, `G L`, `G S`, `G ,`: Fast 2-key navigation chords.
  - `?`: Keyboard shortcuts modal.

---

## Workspace Architecture

The Hanterill codebase is organized as a modular Rust & TypeScript monorepo:

```
Hanterill-main/
├── apps/
│   └── desktop/
│       ├── src-tauri/         # Tauri v2 native application runtime & IPC commands
│       └── ui/                # React 19, Vite 8, Vitest diagnostic frontend suite
├── crates/
│   ├── application/           # High-level diagnostic use cases, contracts, & session engine
│   ├── cma/                   # CMA platform definitions (ECU catalogue, DIDs, decoders)
│   ├── transport/             # ISO 13400 (DoIP) and ISO 14229 (UDS) protocol implementations
│   ├── uds_dtc/               # SAE J2012 / ISO 14229 DTC status-byte decoding
│   ├── storage/               # SQLite diagnostic session evidence store
│   └── ffi/                   # UniFFI cross-platform bindings
└── docs/                      # Technical specifications, platform guides, & safety rules
```

---

## Safety, Privacy & Data Ownership

- **Read-Only Safety Boundaries**: Standard diagnostics strictly use read-only UDS services (`0x22`, `0x19`). Destructive clearing (0x14) and actuations (0x31) fail closed unless compiled with `--features unsafe-write-ops` (`SAFE-001`, `DTC-002`).
- **100% Local & Private**: Hanterill contains zero analytics, zero crash telemetry, and zero cloud dependencies. Diagnostic sessions and activity logs are stored locally with automated 17-character VIN redaction (`PRIVACY.md`, `EXPORT-001`).
- **Shipped Capabilities Manifest**: See [docs/product/capabilities.md](docs/product/capabilities.md) for the verified runtime capability and safety boundaries matrix (`DOCS-001`).
- **Privacy Policy**: See [PRIVACY.md](PRIVACY.md) for the full Zero-Telemetry data ownership policy, storage locations, VIN redaction rules, and retention controls.
- **Safety Guidelines**: See [docs/safety.md](docs/safety.md) for read-only diagnostic boundaries and high-voltage safety notices.

---

## Disclaimer & Legal Notice

Hanterill is an independent, source-available diagnostic project developed by the community. It is **not** affiliated with, authorized by, maintained by, or in any way officially connected with **Polestar Performance AB**, **Volvo Car Corporation**, **Geely Automobile Holdings**, or any of their subsidiaries or affiliates.

> [!WARNING]
> Electric vehicles contain high-voltage systems (400V/800V) capable of causing serious injury or death. Service routines physically actuate vehicle mechanical systems. Always follow the safety precautions documented in [DISCLAIMER.md](DISCLAIMER.md) before connecting to or servicing any vehicle.

All product names, logos, brands, and vehicle models are trademarks or registered trademarks of their respective holders.

For the full legal disclaimer, warranty limitations, and automotive safety notices, see **[DISCLAIMER.md](DISCLAIMER.md)**.

**Private use only.** Hanterill is licensed **CC BY-NC-ND 4.0**: read, run and share it for personal, non-commercial use, with no commercial use and no distributing modified versions. The source is available to read; it is not OSI open source. See [LICENSE.md](LICENSE.md) for the full terms.
