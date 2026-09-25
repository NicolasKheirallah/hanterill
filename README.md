# Hanterill

> **A desktop app for reading vehicle health, fault codes and battery information.**

This repository contains Hanterill's public website and user guides. The app's source tree is private. This README gives a short overview; the guides explain each task in more detail.

The app is available for macOS, Windows and Linux. Its private-use terms are in [LICENSE.md](LICENSE.md).

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
11. [Safety, Privacy & Data Ownership](#safety-privacy--data-ownership)
12. [Disclaimer & Legal Notice](#disclaimer--legal-notice)

---

## About the Project

**Author:** Nicolas Kheirallah

**Hanterill** is a desktop app for checking supported Volvo, Polestar and related vehicles through a cable. It shows battery condition, fault codes and other readings reported by the car. The app works locally on your computer and is licensed for private, non-commercial use.

---

## Supported Vehicles & Platforms

Hanterill is built around the Geely/Volvo architecture families, with a per-vehicle verification status. Reading the table: *Verified* means exercised against a live reference vehicle; *Catalogued* means the ECU registry, identifiers and decoders ship but are pending hardware confirmation; *Research* means the platform is being investigated.

| Vehicle | Platform | Model Years | Supported Powertrains | Verification status |
| :--- | :--- | :--- | :--- | :--- |
| **Polestar 2** | CMA | 2021 to Present | Standard Range Single Motor, Long Range Single Motor (FWD & RWD), Long Range Dual Motor (AWD), Performance Pack | Verified (reference vehicle) |
| **Volvo EX40 / XC40 Recharge** | CMA | 2021 to Present | Single Motor (FWD & RWD), Twin Motor (AWD) | Verified |
| **Volvo EC40 / C40 Recharge** | CMA | 2022 to Present | Single Motor, Twin Motor (AWD) | Verified |
| **Volvo EX30** | SEA1 | 2024 to Present | Single Motor, Twin Motor Performance | Catalogued (107-group LFP and 108-group NMC layouts), hardware confirmation pending |
| **Polestar 4** | SEA1 | 2024 to Present | Single Motor, Dual Motor | Catalogued (110-group layout), hardware confirmation pending |
| **Zeekr 001 / X / 009** | SEA | 2021 to Present | Single Motor RWD, Dual Motor AWD | Direct gateway connection verified on Zeekr 001; sub-platform module mapping in progress |
| **Lynk & Co 01 / 02 / 05** | CMA | 2020 to Present | Primarily PHEV (EM-P) | Research; center-tunnel hybrid pack layouts catalogued |
| **Volvo XC60 / S60 / V60 / S90 / V90 / XC90 Recharge** | SPA | 2016 to Present | T8 plug-in hybrid (96-group and 102-group packs) and combustion variants | Provisional DoIP connection, module inventory and fault scans verified on V90 T6; live hybrid battery verification pending |
| **Volvo EX90 / Polestar 3** | SPA2 | 2024 to Present | Single & Dual Motor | Research; different gateway and security model |

Multi-architecture support is built into the app from the ground up: platform auto-detection, per-architecture ECU registries, and 11 battery pack layouts stored as data rather than hardcoded assumptions.

---

## Supported ECUs & Subsystems

Hanterill maps and probes up to **49 Electronic Control Units (ECUs)** on the CMA catalogue communicating across high-speed Ethernet and gateway bridges:

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

- **CEM (Central Electronic Module)**: Master security gateway, 12V low-voltage power distribution, sleep manager, and 256-option car configuration store.
- **BECM (Battery Energy Control Module)**: Traction battery management, 108 series cell-group voltages (27 modules of 4 groups on the reference pack), pack temperature channels, State of Health (SoH), State of Charge (SoC), and contactor status.
- **BCM2 (Brake Control Module 2)**: Integrated Power Brake (IPB), ABS, Stability Control, Electric Parking Brake (EPB) calipers.
- **VCU1 (Vehicle Control Unit)**: Drive coordination and torque delivery for the front and rear permanent magnet synchronous motors. The inverters themselves are addressed separately as IHFA (front axle) and IEM (rear/ERAD).
- **TCAM (Telematics & Connectivity Antenna Module)**: LTE modem, GNSS positioning, emergency backup battery, Bluetooth key transceiver.
- **ASDM (Active Safety Domain Master)**: Pilot Assist forward camera, emergency collision avoidance, radar/vision fusion.
- **CCM (Climate Control Module)**: Heat pump thermal loop, PTC cabin heater, 8 blend door damper actuators, A/C compressor.
- **DIM (Driver Information Module)**: 12.3-inch driver instrument cluster, Service Reminder Indicator (SRI), odometer sync.

---

## Supported Diagnostic Protocols & Services

Hanterill implements the automotive diagnostic networking stack across Ethernet and internal vehicle buses:

| Protocol / Standard | Specification | Function in Hanterill |
| :--- | :--- | :--- |
| **ISO 13400-2 (DoIP)** | Diagnostics over Internet Protocol | Auto-discovers vehicles over UDP/TCP Port 13400 (with direct gateway fallback for silent vehicles), negotiates routing activation, handles functional broadcast queries, and manages keepalive messages. |
| **ISO 14229-1 (UDS)** | Unified Diagnostic Services | Standardized diagnostic request and response language running inside DoIP frames. |
| **Diagnostic Session Control** | UDS Session Management | Switches target modules between Default and Extended Diagnostic sessions when a read or service routine requires it. |
| **Clear Diagnostic Information** | UDS Fault Clearing | Erases trouble codes per module or across the car, with optional freeze-frame backup before clearing and a verification re-read afterward. |
| **Read DTC Information** | UDS Fault & Snapshot Reads | Reads fault counts, fault lists, freeze-frame snapshots, and extended status counters to separate active warning-light faults from routine self-test history. |
| **Read Data By Identifier** | UDS Parameter Reads | Reads high-resolution telemetry, battery cell-group voltages, thermal measurements, VIN, software versions, and factory build records. |
| **Periodic Data Sampling** | UDS Live Streaming | Streams live channels at a steady cadence for charts and recordings. |
| **Routine Control** | UDS Service Routines | Reads stored routine results and starts confirmed maintenance procedures (such as parking brake retraction or climate damper calibration). |
| **Security Access Check** | UDS Lock Inspection | Checks in read-only mode whether a module's security level is currently locked or unlocked, without attempting to unlock it. |
| **CAN Bus Listening** | Passive Internal Bus Traffic | Explains which continuous signals (such as steering wheel angle or individual brake pressures) travel on internal CAN buses rather than Ethernet, with passive listening on supported interfaces. |

---

## What You Can Do With Hanterill

### 1. Traction Battery Health & Degradation Check
- **True State of Health (SoH)**: Read the battery health percentage directly from the battery management module, alongside State of Charge cross-checked across multiple modules.
- **Full Cell-Group Breakdown & History**: Visualize every series cell-group voltage (108 cell groups across 27 modules on the reference CMA pack) with imbalance highlighting, multi-session health trend tracking per car, and cell-by-cell comparison between visits. The cell map adapts automatically across 11 catalogued battery pack layouts for CMA, SPA, and SEA vehicles.
- **Thermal Grid & Residence History**: View pack temperature sensors, an 8-band lifetime temperature residence histogram (from below -10 °C to above 50 °C), and cross-signal consistency checks (comparing reported pack voltage against the sum of individual cell groups).

### 2. Full-Vehicle Fault Code (DTC) Triage
- Scan the 49-module CMA catalogue in one pass over Ethernet, accelerated by broadcast collection and per-vehicle module caching.
- Distinguish between **Active** faults (currently causing warning lights), **Pending** faults, and **Stored** historical faults. Because modern cars store hundreds of routine self-test records, the Fault Codes screen opens filtered to **Needs Attention** by default.
- Inspect **Freeze-Frame Snapshots** (vehicle speed, 12V supply voltage, pack temperature, mileage) captured at the moment a fault occurred, or look up any fault code offline.
- Compare fault scans before and after a repair with one-click comparison against your most recent saved session.

### 3. DIY Maintenance & Service Procedures
> [!IMPORTANT]
> The operations below change the vehicle. Each one needs a separate confirmation. Some routines are protected by the car's security levels, which the app can inspect without unlocking. Nothing here flashes firmware or unlocks protected modules. See [the safety guide](src/content/docs/safety.mdx).
- **Fault Code Clearing**: Clear only faulted modules by default (or the whole car), with optional toggles to save freeze-frame snapshots first and re-verify afterward.
- **EPB Service Mode**: Retract the rear electric parking brake calipers into service position to perform rear brake pad or rotor replacements safely, then return and calibrate them when finished.
- **12V Battery Adaptation Reset**: Reset the learned 12V battery aging counters after installing a new 12V battery.
- **Service Reminder Indicator (SRI) Reset**: Clear the maintenance reminder message and reset the service countdown timer.
- **HVAC Damper Calibration**: Cycle and re-learn end-stop limits for the climate blend door motors.
- **Panoramic Sunroof Normalization**: Reset anti-pinch travel bounds for panoramic roof shades and windows.

### 4. 12V Parasitic Sleep Drain Analysis
- Diagnose mysterious 12V battery drain and telematics sleep failures.
- View standby current time-in-band histograms, accumulated energy draw while parked, and module wake-state logs.

### 5. Live Telemetry Waveforms & CSV Export
- Stream and chart drivetrain, inverter, thermal, and battery measurements, then replay saved recordings offline.
- Export reports and measurements (Vehicle Summary, Cell-Group Voltages, Fault Records, Module Inventory, Battery Health Trends) to standard **CSV** and **JSON** files.

### 6. Pre-Purchase Inspection (PPI) Report
- A scored vehicle-condition grade covering battery degradation, cell balance, fault severity, and odometer consistency across up to 29 modules.
- Choose from three printable report layouts: **Executive inspection** (a one-page summary for buyers and sellers), **Battery certificate** (focused on high-voltage pack health and cell balance), or **Technical dossier** (full module inventory, faults, and evidence).
- Stored sessions can be re-evaluated offline without reconnecting to the vehicle. Reports print natively; GPS position is excluded by default.

### 7. Session Archive, Cross-Checks & Offline Intelligence
- Local session store with operator notes, automatic corrupt-file recovery, and five side-by-side comparison views across fault codes, battery health, cell voltages, module inventory, and software versions.
- Dedicated **Cross-Check** view that compares how multiple modules report the same real-world figure (VIN, odometer mileage, battery State of Charge, 12V system voltage, and service countdowns).
- Full-car parameter sweeps that can resume interrupted scans by retrying only missed modules, plus an offline parameter browser that re-decodes saved captures as new definitions are added.
- Multi-module odometer cross-checks, TCAM backup-battery health (with automatic fallback when the primary read returns a GPS log), live GNSS satellite skyplot, steering angle state, service schedule countdowns, and printable vehicle configuration sheets (256-option car configuration map and factory build codes).

### 8. Work Without a Car
- Built-in simulated vehicles on the Connection screen (healthy baseline, fault-injected, and sleep-drain scenarios) let you explore every screen offline, always clearly labeled as simulated.

---

## Supported Hardware & Adapters

Hanterill connects over standard wired Ethernet. It does not use Bluetooth or USB serial OBD dongles like ELM327 for Ethernet diagnostics: standard DoIP diagnostics require an Ethernet link.

```
[ Car Diagnostic Port ] ──▶ [ OBD-II to RJ45 (ENET) Cable ] ──▶ [ USB-C / RJ45 Adapter ] ──▶ [ Your Computer ]
```

### Compatible Cables
- Any passive **OBD-II to Ethernet (ENET) cable** (often labeled as *"BMW ENET Cable"* or *"DoIP ENET Cable"*). Note that SEA-platform vehicles (such as the Volvo EX30, Polestar 4, and Zeekr models) require the cable to route 12V power from OBD pin 16 to activation pin 8 so the car switches on its Ethernet port.

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
| **Linux** | Ubuntu, Debian, Fedora, Arch (x86_64 & aarch64) | Fully Supported | `.deb`, `.rpm`, `.AppImage`, `.tar.gz` |

---

## Step-by-Step Connection Guide

1. **Locate the OBD-II Port**: Under the dashboard on the driver's side (near the hood release latch).
2. **Plug In Cable**: Connect the OBD-II end of your ENET cable to the vehicle, and the Ethernet / USB-C end to your computer.
3. **Turn On Ignition**: Sit in the driver's seat or press the brake pedal to wake the vehicle's Central Electronic Module (CEM).
4. **Automatic Addressing**: DoIP uses link-local networking. Your adapter self-assigns an address in the `169.254.x.x` range the same way the vehicle's gateway does; no DHCP server and no manual IP configuration is required.
5. **Launch Hanterill**: Open the desktop app. It will automatically detect your active Ethernet interface, negotiate DoIP routing activation on Port 13400, and show **Connected (DoIP)**.

> [!TIP]
> **No car available?** Open a simulated vehicle from the Connection screen to explore the app. Simulated readings are labeled and kept separate from real scans.

---

## Installation & Getting Started

### Pre-Built Desktop Application
Choose the current installer for your operating system on the website's Download page. The [installation guide](src/content/docs/installation.mdx) explains which file to choose and how to open the app.

> [!NOTE]
> Packaged releases are the supported way to install and run Hanterill on macOS, Windows, and Linux.

---

## User Interface & Theming

You can adjust the interface to suit the task and the lighting around you.

- **Audience Modes**: Switch between **Owner**, **Technician**, and **Engineer** views depending on how much protocol detail you want on screen.
- **Eight Built-In Themes**: Choose from Neutral Light, Neutral Dark, **Protokoll Light** (warm paper high-contrast workshop theme), **Protokoll Dark** (carbon and amber night workshop theme), Polestar Light, Polestar Dark, Nord, and High Contrast, plus a comfortable or compact density toggle.
- **Languages**: Interface localized to English, Swedish, Norwegian (Bokmål), Danish, Finnish, Icelandic, German and Simplified Chinese.
- **Accessibility**: WCAG 2.1 AA held by automated regression tests on every state primitive.
- **Keyboard Shortcuts**:
  - `⌘K` / `Ctrl+K`: Global Command Palette.
  - `G O`, `G C`, `G B`, `G M`, `G E`, `G D`, `G L`, `G S`, `G ,`: Fast 2-key navigation chords.
  - `?`: Keyboard shortcuts modal.

---

## Safety, Privacy & Data Ownership

- **Reading and changing are separate**: Ordinary scans ask the car for information. Clearing fault codes, running a service routine and resetting a control unit need separate confirmation.
- **Sessions stay on your computer**: The desktop app has no account or cloud service for diagnostic sessions. You can mask the vehicle identification number when sharing a report and review a support bundle before sending it.
- **Communication guide**: [How the app talks to the car](src/content/docs/architecture.mdx) explains the cable connection and the car's internal networks.
- **Privacy guide**: [Privacy](src/content/docs/privacy.mdx) explains local storage and sharing controls.
- **Safety guide**: [Safety](src/content/docs/safety.mdx) explains which actions can change the car.

---

## Disclaimer & Legal Notice

Hanterill is an independent, source-available diagnostic project developed by the community. It is **not** affiliated with, authorized by, maintained by, or in any way officially connected with **Polestar Performance AB**, **Volvo Car Corporation**, **Geely Automobile Holdings**, or any of their subsidiaries or affiliates.

> [!WARNING]
> Electric vehicles contain high-voltage systems capable of causing serious injury or death. Service routines can move vehicle parts. Read the [safety guide](src/content/docs/safety.mdx) before servicing a vehicle.

All product names, logos, brands, and vehicle models are trademarks or registered trademarks of their respective holders.

For the legal terms, see [LICENSE.md](LICENSE.md). For a plain-language summary, see the [license guide](src/content/docs/license.mdx).

**Private use only.** Hanterill is licensed **CC BY-NC-ND 4.0**: read, run and share it for personal, non-commercial use, with no commercial use and no distributing modified versions. The source is available to read; it is not OSI open source. See [LICENSE.md](LICENSE.md) for the full terms.
