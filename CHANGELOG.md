# Changelog

All notable changes to Hanterill. Versions follow [SemVer](https://semver.org/).

## [0.2.2] - 2026-09-23

Version 0.2.2 adds initial diagnostic support for Volvo SPA1 vehicles such as the XC60 and XC90, and a connection fallback for Polestar 4 and other SEA vehicles. DID scans now report how much of the planned scan actually completed; an interrupted scan can be resumed with verified results preserved. Screens lead with plain-language findings instead of raw identifiers. When a reading cannot be obtained, Hanterill explains what happened rather than leaving an empty field behind.

### Added

* **Clearer battery diagnostics.**
  When a battery value such as State of Health, State of Charge or learned capacity cannot be read, Hanterill explains what happened instead of showing an empty value: whether the module answered, whether the response could be decoded, and which reading was missing.

* **State of Charge cross-checking.**
  Hanterill compares available State of Charge readings from different vehicle systems and shows whether they agree. Missing sources are named.

* **Battery history and CSV export.**
  Saved sessions can now be used to follow State of Health, State of Charge and battery-cell variation over time. The history can also be exported as CSV for Excel or other analysis tools.

* **Battery history is kept separate for each vehicle.**
  If Hanterill contains sessions from several cars, trends are calculated independently. A State of Health change can no longer accidentally compare two different vehicles.

* **More trustworthy DID scans.**
  The DID Scanner now clearly shows how much of the planned scan was actually completed. A scan that loses connection halfway through can no longer look like a successful full scan.

* **Resume incomplete DID scans.**
  If a scan is interrupted, Hanterill shows what remains to be checked and estimates how many requests are needed to finish it. Already verified results are preserved.

* **Retry only failed ECUs.**
  You no longer need to repeat an entire discovery scan because a few modules failed to answer. Hanterill can retry only the ECUs that had communication problems.

* **Detailed DID Scanner results.**
  Scanner results now include response time, number of attempts, negative responses and clearer result states. Malformed replies, skipped reads and timeouts are shown separately.

* **Re-analyse saved scans with newer Hanterill versions.**
  Previously recorded scans can be checked again using the current diagnostic catalogue. Improvements to Hanterill can therefore reveal more information from an old capture without reconnecting to the vehicle.

* **One-click DID scaling probes.**
  The DID Explorer can automatically test common scaling patterns when investigating an unknown value.

* **Initial Volvo SPA1 diagnostic support.**
  Hanterill now includes provisional diagnostic coverage for SPA1 vehicles such as the XC60, XC90, V60, S60 and related models.

* **Additional SPA battery data.**
  Early support covers State of Charge, State of Health, pack voltage and battery-cell information. Readings that still need vehicle validation are marked as such.

* **Polestar 4 / Geely SEA connection fallback.**
  Some SEA vehicles do not respond to the same discovery process used by Polestar 2. Hanterill can now attempt a direct connection to known SEA gateway addresses when normal discovery remains silent.

* **SEA discovery diagnostics.**
  Hanterill listens for vehicle announcements during discovery and can tell you when the vehicle is present but not accepting a diagnostic connection.

* **Support for DHCP-based diagnostic Ethernet.**
  When a vehicle expects the computer to obtain an Ethernet address first, Hanterill can now explain that requirement instead of only reporting a failed connection.

* **ECU reset from the desktop app.**
  Individual ECUs can now be reset directly from their ECU page. A vehicle-wide reset is also available from Service Routines, with hard, key-off and soft reset types where supported.

* **Security Access inspection.**
  ECU pages can inspect supported security-access levels and show information such as seed availability, seed length and whether a module appears locked. Hanterill does not automatically send security keys during this check.

* **Immobilizer and transponder information.**
  Available transponder information can now be viewed from the Vehicle page.

* **Raw vehicle mode reading.**
  Hanterill can display the vehicle's raw car-mode value where supported. Because the meaning of every possible value has not yet been verified, Hanterill deliberately shows the raw value rather than guessing.

* **The number of registered keys can now be read from supported vehicles.**

* **Offline DTC decoding.**
  You can paste captured fault-code bytes into Hanterill and decode them without being connected to a vehicle.

* **Compare fault scans.**
  After a new fault-code scan, Hanterill can compare it with the most recent saved scan for the same vehicle.

* **More control when clearing fault codes.**
  The clear-fault dialog lets advanced users choose the DTC group to clear and whether Hanterill should save freeze-frame information and verify the result afterwards. The safer options are enabled by default.

* **Scoped firmware audits.**
  Firmware checks can be limited to selected ECUs, a maximum number of modules or a time limit.

* **Service-routine support levels.**
  Service procedures now show how well their behaviour has actually been verified before you attempt to run them.

* **Parking-brake service groundwork.**
  Hanterill now understands the recovered electronic parking-brake control model, including left, right and both-caliper selection. Operations that still require vehicle-specific information remain blocked rather than guessed.

* **Diagnostic security mapping.**
  Hanterill can identify which systems require additional security access before certain procedures can run. Credentials themselves are never displayed.

* **Session evidence export.**
  Captured diagnostic evidence can be exported directly as JSON.

* **Per-DID evidence filtering.**
  Selecting a diagnostic identifier in the evidence viewer lets you focus on only its requests and responses.

* **Connection wire log.**
  The Connection page can now show the actual diagnostic requests and responses exchanged with the vehicle, including response time and negative responses.

* **Configuration reports.**
  Hanterill can generate a printable vehicle-configuration report containing VIN, mileage and decoded option information.

* **Full configuration-map export.**
  Configuration reports can include either only detected options or the complete configuration map.

* **Privacy and report settings.**
  Report contents, units and privacy-related options can now be configured from Settings.

* **Location can optionally be included in Inspection Reports.**
  GPS information remains disabled by default and is only added when the user explicitly enables it.

* **Stored service credentials.**
  Supported service credentials can be stored locally without displaying the saved values back to the user.

* **Storage information and automatic cleanup.**
  The Privacy page can show how much local data Hanterill stores, and old sessions can automatically be removed according to the configured retention period.

* **Advanced CLI diagnostic tools.**
  New expert commands are available for memory reads, dynamic identifiers and periodic data streaming. Safety checks remain in place around commands that can change ECU state.

* **Linux RPM and portable `.tar.gz` packages.**
  Linux releases now include these formats in addition to AppImage and Debian packages.

* **Cross-Check is now directly available from the navigation.**

### Improved

* **The Overview page now explains the condition of the car instead of only showing numbers.**
  Battery health, capacity loss, State of Charge agreement, diagnostic coverage and other checks are presented as understandable findings.

* **More potential problems appear on the Overview page.**
  Hanterill can highlight:

  * possible odometer disagreement
  * State of Charge readings that disagree
  * excessive battery-cell voltage spread
  * incomplete battery-cell scans
  * low 12 V voltage
  * overdue service intervals
  * modules that did not answer
  * active fault codes

* **Charging and TCAM backup-battery status are now included in Overview.**
  Charging activity, charging limitations and TCAM backup-battery health can appear alongside the other vehicle systems.

* **Overview explains missing information.**
  Instead of reporting that several readings are unavailable, Hanterill identifies which readings could not be obtained.

* **Overview timestamps are easier to understand.**
  Capture times are shown as normal local dates and times, making it obvious how old the displayed data is.

* **Pages now use plain-language names first.**
  Normal screens show names such as "Battery State of Health", "Backup-battery voltage" and "Software version" instead of leading with hexadecimal diagnostic identifiers.

* **Technical identifiers remain available where they are useful.**
  Raw DID codes are still visible in the DID Explorer, scanner, ECU details and other advanced diagnostic views.

* **Page headers are more responsive.**
  Pages with many controls no longer squash the title into a tiny space. Controls move cleanly below the title when needed.

* **Inspection Reports have a cleaner document-style layout.**
  Dates, page information, report identifiers and controls have been reorganised to make reports easier to read on both large and small screens.

* **Inspection Reports work better on large displays.**
  The document is centred at a comfortable reading width, with chapter navigation available on wider screens.

* **Report dates and timestamps are easier to read.**
  Dates follow the selected locale and use normal 24-hour formatting instead of raw machine timestamps.

* **Report headers have been simplified.**
  Duplicate privacy text has been removed and long report identifiers are displayed more cleanly.

* **Active and pending faults use the same logic throughout Hanterill.**
  The Fault Codes page, Inspection Report, PDF report and exported data now agree on which faults are currently active.

* **The Vehicle page leads with conclusions instead of repeated numbers.**
  Odometer checks now start with an overall agreement result, while the detailed controller readings are available when you want them.

* **Potential odometer discrepancies are more visible.**
  If controllers disagree significantly, the warning is promoted to the top of the Vehicle page and Overview rather than being buried in a table.

* **Large odometer comparison tables are collapsed by default.**
  You can still expand them to inspect every responding controller.

* **Controller uptime is easier to understand.**
  When ECUs report the same uptime, Hanterill shows a consensus instead of dozens of identical rows. Differences are highlighted only when they matter.

* **VIN display is easier to use.**
  The full VIN is shown on the Vehicle page by default. A masking option remains available when sharing the screen.

* **TCAM information has been reorganised.**
  GNSS information, software information, key-position data and backup-battery information are presented as distinct parts of the module rather than as unexplained raw data.

* **GNSS snapshots are now readable.**
  NMEA data is shown as text with a summary of fix state, satellite count and accuracy. Coordinates remain on the GPS page behind the existing privacy controls.

* **TCAM battery troubleshooting is better.**
  When the normal backup-battery reading is unavailable and Hanterill falls back to alternative TCAM readings, the app shows which attempts succeeded or failed.

* **Very low or unusual TCAM battery voltages are no longer hidden.**
  Hanterill displays the measured value and flags it as unusual instead of discarding it.

* **Connection failures are more descriptive.**
  Hanterill distinguishes between situations such as:

  * no vehicle detected
  * requests could not be sent
  * traffic was received but could not be interpreted
  * a gateway was found but its diagnostic port was closed
  * the connection timed out

* **Service Routines make risk clearer.**
  Medium- and high-risk procedures are labelled accordingly, prerequisites are easier to see, and dangerous operations no longer look like ordinary buttons.

* **Read-only sessions are clearly identified.**
  When write support is unavailable, Hanterill explains that service routines cannot be executed and why.

* **Service routines are easier to navigate.**
  Routine groups have clearer navigation and sticky section headings on larger screens.

* **Service support information is shown before running a procedure.**
  Hanterill can indicate whether a routine is confirmed, provisional, requires additional access or has not yet been verified on the vehicle family.

* **Service Schedule is less technical.**
  Formulas and interval information are described in normal language instead of exposing diagnostic byte identifiers.

* **Fault-code controls are simpler.**
  Low-level protocol settings have been removed from the normal Fault Codes page. Hanterill automatically performs a complete scan and determines which faults are active, pending or stored.

* **Advanced DTC controls remain available in the CLI.**

* **Diagnostic timeouts are more tolerant of slower ECUs.**
  Hanterill now uses more realistic request timing and honours timing information supplied by the ECU itself.

* **Long-running ECU operations handle delayed responses more reliably.**

* **Session switching is more reliable.**
  If an ECU requires a different diagnostic session, Hanterill can enter the appropriate session and retry instead of immediately treating the request as unsupported.

* **Usage Mode detection was corrected using live-vehicle testing.**

* **Software and part-number decoding has improved.**
  Hanterill recognises more formats used by different ECUs instead of rejecting them because they do not use the originally expected encoding.

* **More previously unknown diagnostic data can now be structurally recognised.**
  Hanterill can validate several additional battery, software and module-information responses while still clearly separating provisional findings from fully verified data.

* **Commands and navigation use more understandable names.**
  The command palette, evidence tables and battery-cell details prefer human-readable names over raw identifiers.

* **Desktop and CLI results are more consistent.**
  Battery reports, DTC scans, climate data, motor data and other major results now use the same underlying information rather than separate interpretations.

* **Settings are more consistent between sessions.**

* **Overview odometer units follow the selected km/mi preference.**

* **DTC display preferences are remembered.**

* **Report software information properly follows the report-content setting.**

* **Translations have been expanded across newer screens and features.**

### Fixed

* **Battery readings no longer disappear without an explanation.**
  Hanterill now preserves the read result so it is possible to distinguish a failed vehicle read from a decoder problem.

* **A late battery response is no longer counted as the answer to the next request.**
  A late answer from a timed-out multi-value request could previously be interpreted as the answer to the next battery request. Hanterill now detects this situation and retries the correct reading.

* **Fault clearing is verified properly.**
  Hanterill now checks the complete fault memory after a clear operation. It can no longer report a successful verified clear because one particular fault category is empty.

* **Active and pending fault codes now appear correctly in Inspection Reports.**
  A fault that is currently failing no longer disappears because the ECU has not yet marked it as fully confirmed.

* **TCAM backup-battery fallback is more reliable.**
  Alternative battery reads are attempted even when the main TCAM snapshot itself fails.

* **A measured TCAM battery value is no longer discarded because it looks unusual.**

* **Failed TCAM fallback reads are now shown instead of silently appearing as "not attempted".**

* **Newer DoIP gateways no longer disappear because of an unexpected protocol-version byte.**

* **A silent module is no longer described as returning bad data.**
  Hanterill distinguishes between "the module did not answer" and "the module answered with data we could not interpret."

* **Several battery voltage and power calculations were corrected after comparison with live vehicle data.**

* **DTC evidence information displays correctly again.**

* **Inspection Report finding rows no longer break on narrow layouts.**

* **Inspection Report chapter navigation now stays on the correct section.**

* **Report timestamps and section counters now display correctly.**

* **Buttons, findings and system rows provide clearer keyboard and pointer feedback.**

* **Navigation icons are restored for Charging, Power, Drive Units, HVAC, Engine and Cross-Check.**

* **The desktop application build issue introduced during the 22 September merge has been fixed.**

* **Battery history can no longer compare readings from different vehicles.**

* **Various report, settings, mock-data and desktop/CLI inconsistencies were corrected.**

### Removed

* **Automatic update checking.**
  Hanterill no longer contacts GitHub to look for new releases. Updating the application is now entirely manual, meaning the application itself no longer needs an internet connection for update checks.

* **Unused vendor account storage.**
  The local account cache has been removed because Hanterill does not use the vendor's online services.

* **Flash-download PIN storage.**
  Flashing is not a supported Hanterill feature, so settings related only to software-download credentials have been removed.

* **Unused and duplicate desktop commands.**
  Several commands that duplicated existing functionality or depended on unverified behaviour have been removed.

* **Low-level DTC scan controls from the normal desktop interface.**
  Hanterill now chooses the appropriate full scan automatically. Expert controls remain available from the CLI.

### Under the hood

Version 0.2.2 also contains a reliability and architecture overhaul. Diagnostic results now have a stronger single source of truth, the desktop app and CLI share more of the same result formats, and saved evidence can be re-analysed with newer diagnostic knowledge. Additional checks keep experimental or unsupported functionality from appearing as confirmed.

In practice: fewer contradictory readings, fewer unexplained empty values, more reliable scans, clearer warnings, and a stronger separation between verified vehicle data, experimental findings and information Hanterill does not yet know.


## [0.2.1] - 2026-09-19

This release adds more than 20,000 manufacturer-reference entries covering over
100 vehicle modules, expands diagnostics for combustion and plug-in hybrid
vehicles, and improves scan recovery and reporting. Hanterill now distinguishes
more clearly between values reported by the vehicle, manufacturer-reference
data, unverified information, and unavailable data.

### Added

- Added more than 20,000 documented manufacturer-reference entries across over
  100 vehicle modules. Selected entries can be checked against a connected
  vehicle.
- Added a Capabilities view for supported systems, modules, service information,
  and vehicle capabilities.
- Added an Engine view for supported combustion and plug-in hybrid vehicles,
  backed by hundreds of additional engine-related reference definitions.
  Unverified values remain marked until they are confirmed against a matching
  vehicle.
- Added live readings for engine coolant temperature, engine oil level and
  temperature, fuel level, fuel-pump status, diesel particulate filter data,
  gearbox oil temperature, gearbox adaptation mileage, and 48V battery charge.
- Added scan previews that show the expected support and approximate scope of an
  advanced scan before it begins.
- Added collection of fault-related operating conditions and counters when the
  module provides them.
- Added raw diagnostic responses to session history so module replies remain
  available after the vehicle disconnects.
- Added vehicle-wide ECU reset with state checks. Functions that have not been
  verified on vehicles remain unavailable.
- Added an optional update check in Settings. It is disabled by default, never
  downloads or installs an update, and sends no vehicle information.

### Changed

- Fault clearing now targets modules with detected faults by default, with a
  separate option for clearing the whole vehicle. Progress identifies the
  module currently being cleared, verified, or reset, and preserves the before
  and after results for comparison.
- Compatible reads from the same module now share a diagnostic session, reducing
  repeated vehicle communication during larger scans.
- A non-responsive module no longer blocks the rest of a scan. Hanterill reports
  the missing response and continues with the remaining modules.
- Fault-code scans can recover from temporary connection loss. Before combining
  results, Hanterill checks that the same vehicle has reconnected.
- Platform-specific scans now account for module addressing and omit
  combustion-only modules when scanning an electric vehicle.
- Battery diagnostics show more health information, record connection and
  disconnection activity, and sort module readings more clearly.
- Temperature channels that remain static or otherwise look unreliable are
  identified instead of being presented as confirmed measurements.
- Modules for equipment that was never fitted can be marked as expected absent,
  with the related option or system shown when known.
- Reports and snapshots show the full VIN by default. VIN masking remains
  available when preparing data for sharing.
- Measurements use appropriate precision, conflicting service values are easier
  to identify, and each service value names its source module.
- Compatible diagnostic requests can be grouped, and long recordings are
  written progressively to reduce memory use.
- Large visual components load only when needed.
- Keyboard navigation now covers battery cells, module views, and ECU lists more
  consistently. Buttons and overlays respond sooner, and live charts retain
  their zoom level.
- Revised all eight translations, including broader rewrites of the Danish and
  Norwegian text and shorter interface labels where needed.

### Fixed

- Corrected TCAM backup-battery response handling on CMA vehicles. The change was
  verified on a connected Polestar 2.
- Battery certificates no longer pass when required measurements are missing.
  Cell comparisons appear only when the required cell data was collected, and
  missing measurements use consistent labels.
- Reaching a configured scan limit no longer appears as a cable or vehicle
  communication failure.
- Fixed vehicle-wide requests occasionally missing very fast module responses.
- A failed first recovery step no longer closes a diagnostic session that can
  still recover.
- Restored missing battery, fault-code, ECU inventory, and parasitic-drain data
  in exports, and fixed imports of affected saved sessions.
- Fixed modules that could not be selected in scan-scope controls.
- Fixed software-capability checks that could stop before contacting the
  vehicle.
- Empty module responses are now reported as unavailable instead of being
  decoded as current measurements.
- Corrected radar and module mappings, incomplete-reply handling, stored scan
  results, cancellation during long operations, connection recovery, and
  service-status reporting.

### Reliability and safety

- Operations that can change vehicle state remain protected by safety checks.
- Functions without enough verification on real vehicles remain disabled or
  carry an explicit unverified status.
- Missing and unsupported values remain unavailable instead of being replaced
  with assumed results.

## 0.2.0 - 2026-09-13

This release covers the first full hardware-in-the-loop campaign: read-only
sessions against a production 2023 Polestar 2 Long Range Dual Motor, a 2018 V90
T6, and a 2018 XC40 validated the whole stack. The rest of the release adds the
vendor reference lanes (ICE/PHEV DID data, engine live data, and service-status
reads, all read-only and with zero catalogue promotions), multi-platform battery
diagnostics across CMA, SPA, SEA1, and SPA2, eight-locale internationalization,
modular session export, recording replay, thermal exposure analysis, offline
cell-voltage diffing, and two architecture-review passes that deepened the
diagnostic core.

### Added

#### Vendor reference and diagnostics

- **Service-status reads and usage-mode routines.** The 39 per-family
  service-status rows (7 families, 9 modules: camera/ADAS, SRS/sunroof, PSCM
  steering, EPB brakes, grille shutter, climate, service reset) ship as
  `cma::service_status`, digest-pinned by `SERVICE_STATUS_TABLE_SHA256`. The
  vendor table records these rows without name-decodable arithmetic, so
  `application::use_cases::service_status` returns the raw payload with its
  reference description and never a decoded value; an unmapped module answers
  `NotAttempted` naming the missing mapping. Each row is read in the extended
  diagnostic session, and the phase guard restores the default session
  afterwards. Exposed as `service-status [--family <key>]` (CLI),
  `getServiceStatus` (IPC), and the Capabilities screen's service-status
  section. The write side gains the previously IPC-only usage-mode transition
  as two Service-screen routines (Active / Inactive restore), gated on the
  runtime capability manifest, with CLI integration tests for both the
  read-only rejection and the `unsafe-write-ops` transition path.
- **Vendor per-DID registry, software gating, and engine live data.** The
  reference intake now also ships its per-DID vocabulary: `cma::vendor_dids`
  carries 113 modules, 129 address blocks, and 20,966 DID rows (module,
  address, DID, reference size, vendor description), generated by
  `scripts/vendor_did_registry.mjs`, sanitized before write (no product name,
  no capture-shaped hex, no VIN-shaped token), and pinned by
  `VENDOR_DID_TABLE_SHA256`. The generator refuses to run without an explicit
  `--input`, so no off-repo path ships in source. Two new read surfaces join
  it: `software_gating` answers each version-gating predicate from a measured
  read (IHU `0xD904`, CCM `0xF124`, BCM2 `0xDD0C`, NRCM `0xD97C`) or leaves it
  unknown naming the missing input, with the vendor's known-buggy table
  explicitly `unobservable` rather than invented; `engine_live` decodes 13
  vendor live getters (coolant, oil level and temperature, fuel level,
  fuel-pump state and duty, DPF ash/soot/distance/regen flag, TCM fluid
  temperature and adaptation mileage, 48V SoC) through their canonical
  recipes, entering the extended session for the getters the vendor reads at
  session 3, leaving opaque vendor handlers as raw bytes and unmapped modules
  as explicit `notAttempted`. Exposure: CLI `vendor-dids`, `software-gating`,
  `engine-live`; IPC `getVendorDids`, `getSoftwareGating`, `getEngineLive`;
  the Capabilities screen gains a filtered DID-registry browser and a gating
  section, and the Engine screen and Vehicle screen gain live-data and
  car-profile sections respectively (the profile vocabulary now renders in the
  UX, not only over IPC). The vendor-surface leak scan's change set covers the
  new files.
- **Vendor reference index and car capability surface.** A 2026-09-14 intake
  of the reference export's identity half ships as a native static table
  (`cma::vendor_ref`): 133 vendor ECU rows (address, name, reference DTC/DID
  row counts), 111 module-info rows, and 35 named protocol constants, with the
  canonical table digest pinned by `VENDOR_REF_TABLE_SHA256` and recomputed by
  an application-layer test. The
  intake boundary is recorded in `docs/protocol/catalogue-evidence.md`: the
  20,966-row per-DID table, the 668-param car-config vocabulary, the 40 wire
  models, the vendor network endpoints, the Geely-line rows, and all
  SecurityAccess material stay off-repo. Three new use cases project it: the
  `get_car_has_*` capability predicates (`car_capabilities`, measured from
  `0xF190` presence, with unobservable rows answering `unknown` and naming
  their gap), the vendor car-profile vocabulary (`car_profile`, absent fields
  answered `null` with the missing input named), and the service-family index
  (`service_families`, every requested family with its support level and the
  exact unrecovered boundary; no `0x31` identifiers are invented).
  Four commands (`getCarCapabilities`, `getCarProfile`, `getVendorReference`,
  `getServiceFamilies`), four CLI subcommands (`capabilities`, `car-profile`,
  `vendor-ref`, `service-families`), and a new Capabilities screen wire them
  to both adapters. The ECU registry gains three more never-observed reference
  rows (`SUM 0x1614`, `DEM 0x1638`, `MVBM 0x1652`) under the existing
  ICE-variant scope, with the DEM `0x1634`/`0x1638` decode-lane delta recorded
  rather than silently reconciled; all three ECU mirrors stay pinned in sync.
  A leak scan with a planted negative control
  (`scripts/gates/vendor-surface-leak-scan.mjs`) guards the change set.
- **ICE/PHEV CMA variant DID reference lane (experimental, zero promotions).**
  A 2026-09-13 reference data set for the combustion side of the platform
  (engine, transmission, and urea DIDs; service-routine identifiers explicitly
  absent) ships as `cma::ice`, the same plain-data shape as the ECU and DID
  catalogues, with no data files in the repository and lineage pinned by
  digest constants to a source workbook retained off-repo. Invariant tests pin
  the table's shape (schema-equivalent checks, per-ECU handler membership, a
  hard zero-routine boundary, canonical content digest), and a promotion gate
  admits a row into the shipped DID catalogue only with a `verified_by_scan`
  crosscheck verdict from a matching powertrain-variant vehicle. The
  crosscheck against openCMA's own live scans
  (`scripts/gates/ice-cma-crosscheck.mjs`) joins all 55 bound claims by
  (ECU, DID): 0 verified, 0 contradicted, 1 same-address collision kept as an
  explicit non-conflation (ECM `0xEE40` answers on the BEV as the inverter
  thermal DID), 54 unscanned. The shipped catalogue therefore gains none of
  these rows. The ECU registry grew two never-observed ICE-variant modules
  (TCM `0x1632`, NRCM `0x163D`) with explicit unobserved scope, so BEV presence
  sweeps record them as silent presences instead of faults; all three ECU
  mirrors (Rust, generated webview constants, curated UI catalogue) are pinned
  in sync by a new oracle, and every candidate row is documented with its
  confidence class in `docs/research/ice-cma-research-2026-09-13.md`. No
  routine identifiers, no source binaries or raw tables, no invented decoders.
- **ICE live-decode recipes and read support (reference only, zero
  promotions).** A second, independent capture of the same 2026-09-13 external
  source contributes what the native lane deliberately does not carry:
  byte-level decode recipes for 272 live-decoded DIDs (`cma::ice_decode`,
  content-digest pinned), 217 opaque-handler rows rendered as raw bytes only,
  208 Level-4 candidates kept out of canonical iteration, and the 66-function
  / 33-routine-label surface. A new read-only `engine` use case probes presence
  and reads every bound channel with shared-DID fan-out and skip accounting
  (`0x22` only). Desktop commands `getIceEngineReport` (quota-gated vehicle
  read; scan-class operation deadline with sweep bus pacing) and
  `getIceCatalogue` (offline) sit behind the `iceRead` capability flag, with an
  Engine screen (`/engine`, eight locales, mock scenarios) and a CLI
  `ice-status` subcommand. Nothing enters `did_engine::catalogue`; the
  promotion audit is untouched and still green, and routine identifiers remain
  unrecovered by explicit boundary. Provenance:
  `docs/research/ice-decode-recipes-2026-09-13.md`.

#### Battery and multi-platform support

- **Multi-platform battery diagnostics and topologies (CMA, SPA, SEA1, SPA2).**
  - A [Battery Platform Support Matrix](docs/research/battery-platform-support-matrix.md)
    details physical locations, DIDs, broadcast frames, and verification
    confidence across all four vehicle architectures.
  - Pack topologies and nominal capacities were sourced and validated:
    - **CMA**: 108S (78 kWh, 27 modules x 4 cells) and 96S (69 kWh, 24 modules
      x 4 cells, single-motor).
    - **SPA**: 102S hybrid (18.8 kWh Extended Range T8 PHEV, 6 modules x 17
      cells), 96S hybrid (11.6 kWh early T8 PHEV, 6 modules x 16 cells), and
      108S EV (78 kWh, 27 modules x 4 cells).
    - **SEA1** (Volvo EX30, Zeekr X): 107S NMC (69 kWh) and 120S LFP (51 kWh
      standard range).
  - State of Health was sourced and verified per platform: 4-byte IEEE float
    for CMA (DID `0x496D`), 2-byte u16/100 percentage for SPA (DID `0x496D` on
    BECM `0x0735`), and candidate decoders for SEA1.
  - SPA CAN broadcast frame decoders ship in `cma::spa` and
    `crates/application`: frame `0x3A` pack power
    (`SpaPackPower::pack_power_kw`, `decode_spa_pack_power`, computing
    `V x I / 1000` kW with discharge positive and regen negative) and frame
    `0x413` pack temperatures (`SpaPackTemps::to_thermal_report`,
    `decode_spa_battery_module_temperatures`, converting 13-bit signed CAN
    temperatures into `BatteryThermalReport`).
- **Thermal exposure profile (DID `0x414B`).** `ThermalExposureSection.tsx` on
  `BatteryPage` reads and visualizes the pack's lifetime thermal exposure
  histogram across 8 temperature bands (below -10°C to above 50°C), and the
  overview page computes total operational hours, the percentage inside the
  optimal 15°C to 35°C window, and a thermal stress index.
- **Offline cell voltage snapshot diffing (`CellsDiffDialog`).** A
  side-by-side comparison modal in `BatteryCellsPage` compares two
  cell-voltage captures (baseline and current) completely offline: per-cell
  millivolt deltas, cell spread change (for example 14 mV to 28 mV), and
  out-of-family drifting cells, with no diagnostic traffic on the vehicle bus.
- **Partial module retry for the battery cell matrix.** "Retry Missing
  Modules" (`cells.partialRetry`) in `BatteryCellsPage` re-queries only
  timed-out or missing modules without discarding valid readings or restarting
  the full sweep.

#### Desktop app

- **Platform support level indicators (`SupportLevelChip`).** Dynamic
  architecture badges in connection headers (`SupportLevelChip.tsx`,
  `supportLevel.ts`): CMA shows Full Support (catalogue, decoders, and live
  UDS diagnostics), SPA shows Decoders Only (broadcast CAN decoders active,
  transport pending), SEA1 shows Research Preview (quarantined signals,
  verified parameters only), and SPA2 shows Detection Only (detected on the
  bus, diagnostic services not yet active). Each badge carries a localized
  explanation of the architecture's exact capabilities.
- **Vehicle context bar and session phase management (`VehicleContextBar`).**
  A persistent header shows the active vehicle identity, a session duration
  timer, connection lifecycle phase badges (Connected, Connecting,
  Discovering, Needs Attention, Disconnected), and explicit Read-Only vs
  Writes-Enabled state.
- **Demo vehicle simulation mode.** A non-intrusive launcher in the Connection
  page lets the UI be explored and technicians be onboarded without a live
  vehicle connection or synthetic bus traffic.
- **Protokoll theme family (Light and Dark).** Two high-contrast workshop
  inspection themes ("Protokoll Light", a fog-paper daylight bench, and
  "Protokoll Dark", an evening bench) built for tabular readability on
  shop-floor tablets and laptops under harsh garage lighting.
- **Modular multi-file session export.** Sessions export into dedicated JSON
  files (`manifest.json`, `battery.json`, `cells.json`, `thermals.json`,
  `dtcs.json`, `ecus.json`, `firmware.json`, `live_telemetry.json`,
  `parasitic_drain.json`, `service.json`, `vehicle.json`) or tabular CSV files
  (`battery_channels.csv`, `battery_cells.csv`, `battery_thermals.csv`,
  `dtcs.csv`, `ecus.csv`, `firmware_sbom.csv`, `live_telemetry.csv`). An
  interactive Export modal in `/sessions` (`SessionsPage.tsx`) generates
  modular CSV or JSON, packages everything into a single `.zip` archive or
  downloads individual files, and can mask the VIN. The zero-dependency
  PKWARE ZIP builder (`apps/desktop/ui/src/services/zip.ts`) uses the Stored
  method, CRC-32 integrity calculation, and UTF-8 filenames so it runs in any
  browser or webview. The Report Builder in `/sessions` also gained a CSV
  option.
- **Live telemetry recording playback and live workspace replay.** `/live`
  (`LiveDataPage.tsx`) gained a replay controller with Play/Pause, a time
  scrubber slider, playback speed multipliers (1x, 2x, 5x), and CSV/JSON
  export, plus a "Load Recording" picker for external `.recording.json` files
  to replay offline. The `LiveWorkspace` "Recordings (N)" drawer browses and
  replays stored sessions as well as active runtime recordings (resolving
  finding 1 from `docs/review/screens/24-live.md`), and `RecordingReplay.tsx`
  gained per-channel selection filtering, direct CSV/JSON export buttons, and
  drag-and-drop external recording import.
- **Desktop GUI parity with the CLI diagnostic suite.** All 7 desktop screens
  gained the CLI's diagnostic reach:
  - `DiscoveryPage`: interactive 5-stage Quiet Modules Cascade sweep trigger,
    progress metrics, and a responsive ECU profile display.
  - `FirmwareAuditPage`: "Compare Snapshots" action and dialog for offline
    diffing of two firmware audit manifests.
  - `ConfigPage`: "Retrofit Compatibility Analysis" modal comparing CEM
    `0xC010` vehicle configuration flags against the modules observed on the
    bus.
  - `DidExplorerPage`: UDS Service `0x24` (ReadScalingDataByIdentifier) query
    tool in the HexViewer inspector for scaling formulas, units, and CVD
    bytes.
  - `LiveDataPage`: UDS Service `0x2A` (ReadDataByPeriodicIdentifier)
    interactive transmission probe in the workspace toolbar.
  - `ServiceRoutinesPage`: UDS Service `0x31 0x03` (RequestRoutineResults)
    non-intrusive query dialog for observing routine status without
    actuation.
  - `DtcPage`: UDS Service `0x19` diagnostic panel for live fault counts by
    status mask (`0x19 0x01`) and frozen frame snapshot records
    (`0x19 0x03`).
  - The Tauri IPC bridge (`apps/desktop/src-tauri/src/ipc.rs` and `wire.rs`)
    and application contracts (`crates/application/src/contracts/mod.rs`) now
    support `discoverQuietModules`, `compareFirmwareAudits`, and
    `getRetrofitCheck`, with mock simulation fixtures in `mock-dispatcher.ts`
    for offline testing.
- **Desktop PDF export.** A new export dialog shows a live preview rendered
  from the same print palettes as the document itself, can mask the VIN, and
  includes a summary sheet that works around a macOS WebKit PDF rendering
  crash. Translated into all eight supported languages and unit tested.

#### Settings and localization

- **Internationalization expansion (8 locales, 139 new diagnostic keys).**
  Full native translations for German (`de`) and Simplified Chinese (`zh`)
  join English, Swedish (`sv`), Norwegian Bokmål (`nb`), Danish (`da`),
  Finnish (`fi`), and Icelandic (`is`), expanding full coverage from 6 to 8
  locales. 139 new diagnostic translation keys were sourced across all 8
  locales with 100% key parity and zero untranslated strings: platform
  support badges and tooltips (`support.cma.*`, `support.spa.*`,
  `support.sea1.*`, `support.spa2.*`), vehicle context header and connection
  phase labels (`context.phase.*`, `context.readOnly.*`,
  `context.writesEnabled.*`), thermal exposure histogram and metrics
  (`battery.exposure.*`), the offline cell voltage diff dialog
  (`cells.diff.*`), live workspace telemetry controls and recording states
  (`live.workspace.*`, `live.status.*`, `live.action.*`), session archive
  inspector and delete/disconnect modals (`sessions.*`,
  `session.confirmSave.*`), and categorized settings tabs and developer tools
  (`settings.tabs.*`, `settings.dev.*`, `settings.about.*`). Language is
  detected automatically from browser and OS preferences
  (`navigator.languages`) with BCP-47 region fallback, and the Settings
  switcher persists the choice and updates every component instantly.
  `apps/desktop/ui/src/i18n/core.test.ts` asserts translation completeness
  across all 8 languages.
- **Categorized settings navigation and developer tooling.** Settings is
  restructured into accessible categorized tabs (All Settings, Appearance,
  Connection & Runtime, Privacy & Storage, Developer, About) with ARIA role
  support. The Developer tab adds an anonymized diagnostic support bundle
  export (`DeveloperSettings.tsx`) and a 15-minute verbose diagnostic logging
  toggle. Version metadata is derived from `package.json` and the backend
  `RuntimeCapabilitiesDto`, eliminating hardcoded version numbers.

#### Packaging and CLI

- **CLI replay and export subcommands.** `hanterill export <session.json>
  [--format json|csv] [--output-dir <dir>]` unpacks session archives into
  modular JSON or CSV files, and `hanterill replay <file.recording.json>`
  replays recorded live telemetry through the CLI virtual time engine.
- **`did-kb --fold`.** Reads a stored scan capture and folds each result into
  the learned DID knowledge base, classified as validated, unvalidated,
  unsupported, refused, timed out, or malformed.

#### Core diagnostics

- **One shared layer for raw diagnostic reads.** DID scaling reads, routine
  results, fault-code counts, and periodic sampling now live in one shared
  primitives module, and the individual use cases became thin wrappers around
  it. Diagnostic sessions gained a single entry point for these reads, so
  every adapter resolves an intent through the resolved vehicle instead of
  assembling raw requests by hand. The command planner, transport port, and
  test transports were extended to match.
- **Periodic data streaming.** The car can push readings on a schedule
  instead of answering one request at a time: a single request starts the
  stream at a chosen rate (about every 5 seconds, every second, or every 100
  milliseconds) and the samples arrive in order in one report. The stream
  always stops cleanly when the session ends, fails, or is cancelled, and can
  also be stopped early on demand. The desktop app gained a matching one-shot
  sampling command.
- **5-stage quiet-module discovery.** `quiet-discovery` sweeps the modules
  that stayed silent during normal inventory: it checks presence, opens a
  diagnostic session, reads the identity records (session state, VIN, part
  numbers, software identification), asks for fault-code counts, then closes
  the session cleanly. Each module ends in one of three clear states: unfitted
  or silent, present but only reachable in the default session, or present and
  fully open for extended diagnostics. Validated live against 29 quiet
  modules with no disturbance on the vehicle bus. The strategy is documented
  in `docs/research/quiet-modules-discovery-strategy.md`.
- **Park Assist Camera added to the catalogue.** A previously unmapped camera
  module was identified and reverse-engineered during the live campaign,
  bringing the CMA registry to 44 ECUs with hardware and diagnostic part
  numbers, serial number, three software blocks, and fault-code reporting. A
  car carries this module exactly when the 360-degree surround camera option
  is absent, which the quiet-discovery sweep corroborated.
- **Factory equipment and option package inference.** A new report combines
  the factory build sheet with the modules that actually answered on the bus
  to determine which commercial packages are fitted, not fitted, or require
  visual inspection. It resolves the Pilot Pack tier (full pack with LED
  headlights, the reduced Pilot Lite, or none), Plus Pack, Performance Pack,
  power tailgate, wireless phone charger, and phone-as-key. Vehicle DNA now
  shows decoded paint and upholstery names (for example "Void" and "Slate")
  next to their codes.
- **Live vehicle verification campaign.** A full read-only session against a
  production 2023 Polestar 2 Long Range Dual Motor validated the whole stack:
  26 modules answered one broadcast query in 365 milliseconds (well over a
  hundred times faster than asking each in turn), all 28 modules that report
  mileage agreed exactly at 122,542 km, battery health read 89.98%, and all
  108 cell voltages sat within 6 millivolts of each other.
- **Faster module inventory on desktop.** The ECU inventory and overview
  discover modules with one functional broadcast instead of asking each
  module in turn, cutting initial discovery from many seconds to a fraction of
  one.

### Changed

- **Per-platform battery live-PID catalogue (2026-09-13).** The battery report
  and the desktop live stream resolve every channel's ECU through the
  address-resolution seam (`resolve_live_pid_ecu`) instead of trusting the
  catalogue's CMA-capture addresses: an SPA BECM channel reads `0x735`, a
  channel whose ECU has no platform mapping stays visible as a `NotAttempted`
  channel (a typed error sample in a live stream), and only
  SPA-gate-authorized DIDs transmit.
- **Scoped DID engine priority (`battery.rs` and `live.rs`).**
  Platform-specific DID lookups
  (`cma::did_engine::lookup_definition(read_ecu, pid.did)`) now take priority
  over static PID definitions whenever `read_ecu != pid.ecu`. This resolves
  SPA HV pack voltage (DID `0x4803` on BECM `0x0735`) at its native 0.01 V/bit
  resolution (for example 388.73 V) instead of failing plausibility checks
  against CMA's 1.0 V/bit integer scale.
- **Independent controller resolution in power telemetry (`power.rs`).**
  `read_power_telemetry` resolves OBC, DCDC, CEM, and BECM independently
  through the address seam instead of requiring an all-or-nothing tuple. This
  lets platforms with partial ECU mappings (such as SPA with BECM `0x0735`)
  measure auxiliary 12V voltage (`0xF442`) while unmapped controllers cleanly
  report `ObservationState::NotAttempted`.
- **Pack layout and physical enclosure disambiguation (`CellDetailDrawer.tsx`,
  `BatteryCellsPage.tsx`).** `topologySlug` now drives module geometry and
  physical enclosure:
  - SPA T8 PHEVs (`spa-102s-hybrid`, `spa-96s-hybrid`): transmission center
    tunnel.
  - CMA 96S EV: underfloor chassis tunnel (modules 1 to 16) vs under-seat
    stack (modules 17 to 24).
  - CMA 108S EV: chassis tunnel (1 to 15), rear footwell (16 to 21), and
    under-seat stack (22 to 27).
  - Series position labels (`#{cellIndex} of {totalCells} in the {totalCells}S
    chain`) and module cell counts (`cell {subCellNum} of {cellsPerModule}`)
    no longer hardcode 4, 16, or 17 cells per module.
  - Wire facts show `Array DID` (`0x4806`) for SPA hybrids and `Module DID`
    (`0x4B10` onward) for CMA quads.
- **Multi-platform UI and CLI generalization.** Hardcoded `BECM 0x1635` and
  `108-cell` strings were eliminated across `BatteryHealthMatrix`, `PowerPage`,
  `VehiclePage`, `SessionComparison`, `CommandPalette`, and CLI report
  headers. `BatteryCellsPage` generates its module DID range dynamically
  (`0x${(MODULE_DID_START + cellWire.moduleCount - 1)}`).
- **Design system and theme contrast polish.** Responsive layouts, SVG
  blueprint accessibility, and dark mode contrast were polished across
  `BatteryPage`, `BatteryCellsPage`, `CellDetailDrawer`, `PackBlueprint108`,
  `CellVarianceCurve`, `ConfigPage`, `ParasiticDrainPage`, and `ReportPage`.
- **Architecture deepening (2026-09-12 second review, twelve candidates).**
  - One exchange choke point: `DiagnosticService::exchange` owns the
    phase-lock refusal, architecture gate, read-only service gate, timeout,
    and profile fold; `read_did` classifies on top of it, and
    `read_did_in_extended_session` tears down through the session-phase guard
    with echo validation, so ADR 0009 §2.1's "every entry point" holds by
    construction.
  - One multi-ECU sweep seam (`use_cases::sweep`): present-first ordering,
    cancellation, and the known-absent skip live in one probe stream consumed
    by the DTC scan, DTC clear, firmware audit, ECU inventory, uptime, and
    mileage flows. The uptime and mileage rosters moved to
    `cma::ecu::MASTER_COUNTER_ECUS` (subset-tested), and their sweeps are now
    cancellable.
  - One Identity Recheck gate (`use_cases::identity`): the DTC sweep's
    reconnect-and-resume now crosses it (`ResumeOutcome::identity_refused`),
    so a mid-sweep vehicle swap is reported, never merged. The private
    did-scan helper and the CLI's inline VIN arming collapsed into
    `capture_known_vin`.
  - One infallible telemetry seam: `read_subsystem` answers the queried
    variant with drain/thermals/uptime absences typed inside the answer
    (`SubsystemAnswer`); the ten adapter fallback rituals are gone, including
    the desktop wire's double-read of failed thermals/uptime/drain.
  - Subsystem reads resolve addresses through the ECU Address Resolution seam
    (`resolve_by_name`): the fourteen telemetry modules carry no address
    constants, an SPA BECM is addressed at `0x735`, and unmapped names answer
    `NotAttempted` instead of a guessed read.
  - One battery capture view (`use_cases::capture_view`): the channel-key
    vocabulary and the thermals gather live once under the Cross-Signal
    Consistency and Charge Diagnosis compositions.
  - The desktop `startDidScan` routes through `did_scan_run::run_scan`: the
    ~160-line adapter read loop and its guessed NRC codes are gone, and
    learned applicability from the persisted store feeds the scan planner on
    every adapter.
  - One knowledge-fold policy (`knowledge_base::fold_scan_all_row` /
    `fold_scan_range`): verification re-samples are skipped, the profile hash
    resolves in one place, and store failures are counted. The desktop and CLI
    copies are gone.
  - One application plan module (`use_cases::did_plan`): the mode vocabulary,
    its validation, and the canonical `did-plan/1` document render once; the
    knowledge knob is fed or deleted, and no adapter keeps a mode match.
  - One vehicle-summary gather (`use_cases::vehicle_summary::gather`):
    identity, factory, mileage, schedule, uptime, keys, battery, cells, and
    drain under one acquisition behind named `SummaryPlan`s; the FFI
    projections render canonical results and derive no stats or odometer
    labels.
  - One desktop long-op runner (`run_long_op`): `begin`, the wait gate with
    its rejection terminal, the panic fuse, and the terminal vocabulary exist
    once; each `start_*` is a work closure.
  - Canonical documents staged wave: `battery::report_document`,
    `dtc_clear::clear_document` (the CLI `clear-dtcs --json` exports the same
    `dtc-clear/1` artifact the desktop persists), `did_plan::plan_document`,
    and the recording manifest family owned by `application::recording`; the
    desktop no longer hand-builds manifest JSON.
- **Architecture deepening (2026-09-12 first review, six candidates).**
  - The ADR 0009 receive seam is finished: `Connection::receive_unsolicited`
    implements unsolicited reception on the live transport (inbox-draining,
    alive-check answering, per-reader buffering), forwarded through the async
    `CancellableTransport` and both application-port adapters. Capability
    absence is a typed `NotApplicable`, and `stream_periodic` fails loudly
    instead of returning an empty report. ADR 0009 §1/§2.1/§2.3 are now
    implemented and recorded in the ADR; §4 desktop event multiplexing remains
    open.
  - One `SessionPhaseGuard` module (`use_cases::session_phase`) owns RAII
    teardown for the periodic stream and the quiet-discovery extended session,
    including an echo-validated stop. ADR 0010's future `DynamicDidGuard` lands
    as its third configuration.
  - Quiet discovery reads the registry instead of a drifting copy: the roster
    moved to `cma::ecu::QUIET_ECUS` (subset-tested), stage-3 identity reads
    cross the `read_did` choke point, and the sweep honors a per-probe budget,
    cancellation, and per-module events (`QuietDiscoveryReport::cancelled` is
    new).
  - The unused intent dispatch shell (`execute_intent`/`IntentReport`) was
    deleted; the pure command planner (`plan_for`) keeps its interface.
  - Factory-option inference keys on `cma::ecu` constants and the shared
    `is_dual_motor_vin` VIN grammar instead of private literals.
  - `ReadOnlyTransport` collapsed: the four health accessors became one
    `health_snapshot() -> TransportHealth`, and "unsupported" answers one way
    (`Err(NotApplicable)`) across the seam.
  - The cells legacy entry points (`read_battery_cell_matrix_for_topology*`,
    the local `BECM` constant) were deleted. The planner-resolved entry points
    are now the only way into the cell-matrix read.
- **Battery cross-signal checks grew from ten to fourteen.** Four new checks
  compare per-cell health data against pack-level values: cell health spread,
  cell health against the pack's own reported health, cell charge-state
  spread, and learned cell capacity against the nominal 180 Ah of the 78 kWh
  pack. The check input now combines the regular battery report with the full
  108-cell health read.

### Fixed

- **The architecture request gate refused every new vendor-parity read.** The
  gate (`ArchitectureSession::permits`) authorizes a `0x22` read only for a
  promoted-catalogue definition, a live-PID channel, or an ICE reference-lane
  bound pair. The `engine_live` getters and all 39 `service_status` rows are
  reference vocabulary in none of those sets, so on a real vehicle (which
  always carries a resolved architecture session) the gate refused every one
  of them. The scripted integration tests install no session, so they passed
  while the shipped read could not work. Both read sets are now closed
  authorization sets (`ICE_LIVE_GETTER_PAIRS`,
  `service_status::is_status_pair`) consulted by the gate, with a permanent
  regression test (`tests/vendor_read_gate.rs`) pinning that they authorize,
  that a DID outside both sets still refuses, and that the gate mirror cannot
  drift from the getter table.
- **`service_status` SOD rows carried the wrong vendor address block.** SODL
  and SODR answer on two address blocks in the reference export; the corner
  radar status rows live on `0x1350`/`0x1351`, not the registry's
  `0x1432`/`0x1433` that the table had recorded. The read still targets the
  registry address (the gate resolves by name), and the table now records the
  block the export actually carries, with a test asserting registry resolution
  and wire-pair authorization.
- **`engine_live` and `service_status` exited 0 on an incomplete read.** The
  documented CLI contract is that a clean result with missing coverage exits
  1. Both new reads now honor it (an uncovered family exits 0), with CLI
  integration tests for each branch.
- **Reference reads did not enter the extended diagnostic session.** Both read
  sets come from session 3 (`0x10 0x03`); both use cases now enter it through
  the phase guard that restores the default session, and the scripted fixtures
  cover the entry/exit traffic.
- **Wrong evidence labels on reference rows.** The service-status rows cited
  the platform's own DID-capture evidence and Polestar capture scope; they now
  cite the reference intake (Experimental) under the unobserved ICE/PHEV
  scope, matching what they actually are.
- **`service-status --json` rendered the DID as `0x0x2202`.** A `{:#06X}` was
  applied to an already-prefixed value; the webview boundary had the same
  typo.
- **PSCM `0x3018` description lost the vendor's double space,** so the row was
  not a verbatim transcription of the reference.
- **Dynamic version introspection.** About disclosures derive from
  `package.json` and the backend `RuntimeCapabilitiesDto`, eliminating
  hardcoded version strings across the desktop shell.
- **Strict null safety in blueprint rendering.** `focusCell ?? 0` in
  `PackBlueprint108.tsx` prevents type errors when no cell is active.
- **JSX component child compatibility.** `ReportSectionShell`'s `children`
  prop in `ReportPage.tsx` is now `React.ReactNode`, so conditional rendering
  expressions compile without TypeScript failures.
- **Contract export completeness.** `MODULE_DID_END` is exported from
  `BatteryCellsPage.tsx` to keep the public module contract intact.
- **Modern Rust 1.80+ Clippy compliance.** `(len % 2 == 0)` became
  `len.is_multiple_of(2)` in `crates/cma/src/decode.rs` to satisfy modern
  compiler lints.
- **Thermal spread floating-point defensive clamping (`cma::spa`).** `spread_c`
  is clamped with `(max_c - min_c).max(0.0)` in
  `SpaPackTemps::to_thermal_report`, preventing negative micro-epsilon float
  artifacts when min and max readings are identical.
- **Module temperature fallback and gate classification
  (`battery_temps.rs`).** The `part2_obs.state` match now uses `ref bytes` to
  avoid partial moves, `part2_obs` is included in `is_not_applicable` checks,
  and uncatalogued or refused UDS module temperature DIDs on the target
  platform (for example SPA) return `ErrorCode::NotApplicable` instead of
  masking as `ErrorCode::Malformed`.
- **Clippy lint compliance and build hygiene.** `clippy::items_after_test_module`
  was fixed in `battery_temps.rs` and `power.rs` by declaring public broadcast
  decoders before test modules; unused compiler warnings were cleaned and all
  workspace crates formatted with `cargo fmt`.
- **DTC page clear-operation status.** The summary, error, and audit text
  derive from the tracked clear operation instead of parallel copies, so they
  can no longer disagree.
- **Vitest and CI pipeline hardening.** Automated test gating
  (`scripts/vitest-gate.mjs`) and hardened GitHub Actions workflows (`ci.yml`,
  `frontend.yml`, `release-build.yml`, `security.yml`).
- **Housekeeping.** Broken documentation links fixed, clippy and formatting
  cleanups applied across adapters and catalogue, and eslint taught to ignore
  underscore-prefixed unused variables.

### Security

- **CSV formula injection defense.** All tabular CSV generation across the
  desktop UI (`multiExport.ts`) and CLI (`main.rs`) sanitizes cells that start
  with `=`, `+`, `-`, or `@`, preventing spreadsheet formula execution.

## 0.1.1 - 2026-09-11

Multi-architecture support (Volvo SPA1 and Geely/Volvo SEA), full reference
parity for UDS 0x14 DTC clearing, DoIP functional-broadcast performance, the
v1.0.0 Pre-Purchase Inspection scoring engine, atomic diagnostic transport
refactoring, deeper offline diagnostic intelligence, complete read-only desktop
GUI coverage, and hardware-in-the-loop hardening with stronger privacy
protections.

### Added

#### Platforms

- **Multi-platform architecture and ECU registries (ADR 0008,
  `cma-catalogue/2026.09.1`).**
  - **Volvo SPA1 platform scope (`cma::spa`),** integrated as a parallel
    architecture alongside CMA:
    - Pure CAN-broadcast decoders for SPA hybrid and EV frames (`0x3A` pack
      electrics, `0x413` temperatures, `0x37D` SoC/cell extremes, `0x1A1`
      charge energy, `0x175`/`0x177`/`0x369` power limits), fixing the
      reference driver's 2-byte defect on `0x369`.
    - `SPA_ECUS` CAN-era registry (BECM request `0x735` / reply `0x635`,
      global DTC `0x7FF`) with `ReverseEngineered` evidence and an isolated
      `SPA_CAPTURE_SCOPE`.
    - SPA-scoped DID-engine definitions on `0x735`: 2-byte u16 SoH `0x496D`,
      supply voltage `0xF442`, HVIL `0x491A`, per-module `0x4B00`, and the
      polymorphic aggregate 102-cell `0x4806`, which preserves both the
      216-byte CMA contract and the 102-cell SPA contract via length
      polymorphism.
    - `SPA_PLATFORM` profile tag keeps SPA ECU-profile hashes disjoint from
      CMA modules that share identical addresses and DIDs.
  - **Geely/Volvo SEA1 platform scope (`cma::sea1`).** Complete architecture
    definitions for Sustainable Experience Architecture vehicles (Volvo EX30,
    Polestar 4, Zeekr 001/X/009): an `SEA_ECUS` registry, DoIP target routing
    addresses, service support mapping, tailored DID catalogue entries,
    payload contracts, and battery cell mapping.
  - **Pack topologies (`cma::topology`).** Structured `PackTopology` models for
    CMA 108S, SPA EV 96S (69 kWh), SPA EV 108S (78 kWh), SPA hybrid 102S
    (T8 PHEV), and SEA 107S/110S, with slug lookup, per-platform iteration, and
    populated-count detection. `EXPECTED_CELL_COUNT` became a CMA-108S alias,
    and the cell matrix report accepts explicit topologies
    (`read_battery_cell_matrix_for_topology`).
  - **Unified multi-architecture runtime (`ArchitectureSession`).** Platform
    auto-detection and vehicle resolution coordinator
    (`crates/application/src/architecture_session.rs`, `resolved_vehicle.rs`),
    with dynamic command planning (`command_planner.rs`) that adjusts
    diagnostic sweeps to the active platform.
  - **Factory build record parser (`cma::factory_record`).** A decoder and
    projection pipeline for factory build records (`FactoryRecord`,
    `FactoryBuildSheet`) that extracts and validates anchor VINs (`KNOWN_WMI`),
    factory option codes, exterior paint codes, and interior trim
    specifications (`INTERIOR_NAMES`).
  - **UDS protocol extensions (`transport::uds`).** UDS Service `0x2A`
    (ReadDataByPeriodicIdentifier) send-once seam
    (`periodic_identifier_send_once`), UDS Service `0x31` (RoutineControl)
    request routine results (`request_routine_results`), and dedicated use
    cases for periodic telemetry (`use_cases::periodic`) and routine execution
    tracking (`use_cases::routine_results`).
  - `docs/research/spa-port-2026-09-08.md` records provenance for every
    scaling, the SPA toolkit reconnaissance, the transport dialect table, and
    the first live SPA session plan.

#### DTC clearing

- **DTC clear reference parity (UDS 0x14).** Full parity with the
  reverse-engineered OEM diagnostic tool clearing routines
  (`ClearDtcGlobalImpl`):
  - A tracked operation lifecycle (`startClearDtcs`) with real-time per-ECU
    progress, scoped cancellation, a terminal summary, and persistent fault
    warnings.
  - Force-reset link recovery (`ReadOnlyTransport::recover_link`) that handles
    TCP session re-activation and DoIP routing resumption after an ECU `0x11`
    reboot.
  - Pre-clear freeze-frame backup: `getDtcFreezeFrame` is queried per
    (ECU, code) before erasure and feeds `/dtc-diff` for post-clear
    verification.
  - Per-ECU selective clearing ("Clear this module" in the inspector).
  - A manifest capability gate (dedicated `clearDtcs` flag; mock reports
    false).
  - Full localization across the 6 locales supported at the time (`en`, `sv`,
    `nb`, `da`, `fi`, `is`).

#### Pre-purchase inspection

- **Pre-Purchase Inspection scoring and reporting engine (POLICY-001).**
  - A deterministic rule-based scoring engine (v1.0.0) grades overall vehicle
    condition, pack health degradation, cell voltage balance, DTC severity,
    and odometer consistency.
  - Informational advisory rules cover coolant temperature divergence, overdue
    maintenance intervals, and DC-DC converter bus voltages.
  - Pack thermal grid maps, ECU uptime tracking, and multi-ECU mileage
    cross-validation.
  - Report re-scoring can grade historical stored sessions under current
    inspection policy rules.

#### Offline diagnostic intelligence

- **Offline diagnostic intelligence and ECU-scoped DID engine
  (GATES-DID-ENGINE).**
  - A strict DID definition model per ECU/DID pair: payload contracts,
    validation boundaries, privacy classifications, and maturity tiers.
  - A 14-state typed outcome vocabulary that refuses decodes on unexpected
    lengths or negative response codes (NRC) instead of risking false
    positives.
  - A learned applicability cache (`did_applicability` v3) that tracks
    supported and unsupported DIDs per ECU across sessions to bypass dead
    reads.
  - Deterministic ECU profile hashing from stable identifiers only, excluding
    volatile serial numbers and timestamps.
  - Deterministic offline replay of DID scan CSV captures for analysis without
    a hardware connection.

#### Desktop

- **Desktop GUI expansion and diagnostic routes.** Full read-only GUI coverage
  for all diagnostic domains: `/tcam` (TCAM backup battery health with
  discriminated FD44 layout, raw byte length, and SHA-256 evidence),
  `/steering` (Steering Angle Sensor angle, angular velocity, and calibration
  status), `/service-schedule` (DIM service intervals, mileage/time countdown
  progress bars, and counter anomaly flags), `/gps` (on-demand TCAM GPS fix
  acquisition, explicit user trigger only), `/config` (CEM 256-entry vehicle
  option configuration map with live search and filter), and `/climate`,
  `/motors`, `/charging`, `/power` (live telemetry graphs, front/rear axle
  cross-checks, and charge limitation diagnosis). DID Explorer gained an
  "Analyse stored captures" panel for archived raw captures, a reusable
  accessible SVG/table `Heatmap` component serves battery thermal matrices,
  and UI density is configurable (`DEFAULT_DENSITY`: comfortable or compact).

#### CLI

- **CLI diagnostic subcommands.** New subcommands `clear-dtc`, `did-analyze`,
  `did-kb`, `architecture`, `resolve-vehicle`, `periodic`, and
  `factory-record`, plus a `--topology` flag for `battery-cells`.

#### CI verification gates

- **Automated verification and CI quality gates.** Regression and consistency
  gates: `bundle-budget.mjs`, `p3-check.mjs`, `verify-did-engine-docs.mjs`,
  `verify-did-followups-docs.mjs`, `verify-frontend-wiring.mjs`,
  `verify-hil-readonly-docs.mjs`, and `verify-hil-readonly-status.mjs`.

### Changed

- **Rebranding: openCMA to Hanterill.** Crates were renamed (`opencma-cli` to
  `hanterill-cli` with binary `hanterill`, `opencma-ffi` to `hanterill-ffi`,
  `opencma-desktop` to `hanterill-desktop`, `opencma-fuzz` to
  `hanterill-fuzz`), the Tauri desktop application became Hanterill with
  bundle identifier `org.hanterill.desktop`, and environment variables moved
  to `HANTERILL_*` (vehicle platform references `cma` and `CMA_PLATFORM` are
  preserved). Storage keys migrated to `hanterill.*`, the Windows registry path
  to `Software\Hanterill`, and log files to `hanterill.log`.
- **Licensing.** The project was relicensed under Creative Commons
  Attribution-NonCommercial-NoDerivatives 4.0 International
  (`CC BY-NC-ND 4.0`), source-available for non-commercial use.
- **Diagnostic transport modernization (DOIP-011, CODE-013).** The
  `DiagnosticTransport` trait was deepened into atomic request-response
  exchanges (`exchange` / `exchange_simple`), eliminating split-phase
  send/receive race hazards. Ad-hoc test transport mocks across all 58 unit
  test suites were consolidated into one shared `ScriptedTransport` harness in
  `crates/application`.
- **IPC architecture (CODE-013).** Four hand-maintained command match
  expressions were replaced by a single declarative command dispatch table in
  `wire.rs`, with a unit test asserting every `CommandV1` variant maps to
  exactly one table entry. Operation wire shape serialization is centralized
  in `OpEventEnvelope`.
- **Vehicle sweeping and discovery performance (DOIP-016, DOIP-030).**
  - `exchange_collect` / `request_collect` query all ECUs simultaneously and
    probe stragglers individually only when absent.
  - ECUs absent across 3+ sweeps drop to a shortened timeout budget
    (`DEEP_SILENT_MIN_GAP`), avoiding multi-second hangs on unequipped
    modules.
  - Active diagnostic session (`0xF186`) replaces VIN read (`0xF190`) as the
    presence probe, reducing overhead.
  - Per-VIN profile caching (`VehicleProfileSnapshot`) seeds known-absent
    module sets and RTT estimates from a disk cache keyed by `SHA-256(VIN)`.
  - The consolidated `getOverview` IPC bundles vehicle identity, battery
    report, ECU inventory, service schedule, and DTC scan into a single
    session lock acquisition (`with_service_sweep`), preventing the 5-command
    UI fan-out stampede.
  - Point-read timeouts tightened to a 1000ms default.
- **Subsystem telemetry provenance (HIL §3 / §8).** Subsystem reads (climate,
  motors, charging, power) now emit a typed `Observation<T>` per field through
  a centralized `decode_field` helper, so failed DIDs can no longer collapse
  into silent `None` or manufactured zero values. Centralized rotational
  deadband handling in `application::interpretation` classifies parked
  negative rotor speeds (for example -7.3 rpm) as `Stationary` at the display
  layer without modifying raw values.
- **DTC inspector defaults.** The DTC inspector opens on a "Needs Attention"
  filter that prioritizes active and unconfirmed trouble codes.

### Removed

- **Hand-rolled PDF writer.** The 764-line manual PDF generation writer
  (`pdf.ts` / `pdf.test.ts`) was removed in favor of the native browser print
  pipeline (`window.print()` with styled `@media print` CSS), eliminating
  UTF-8 byte offset corruption and visual drift.
- **Obsolete provenance DTOs (HIL §18).** Deprecated aggregate structs and
  disproved decoders replaced by per-field `Observation<T>` were removed:
  `ClimateHeatPumpTelemetry`, `decode_climate_heat_pump`, `InverterTelemetry`,
  `DualMotorTelemetry`, `ChargingPortTelemetry`, `decode_key_count`.

### Fixed

- **DID scanner reliability and resiliency.**
  - Bus acquisition is retried on transient communication blips during full
    scans.
  - Hold-and-resume scan pause support is restored in `run_scan`.
  - Fine-grained per-read progress events are restored in thin transport
    adapters.
  - Live knowledge base folding during scans is restored through
    `ScanAllEvent::Row`.
  - Unsupported catalogue DIDs are recorded as NRC `0x11` instead of dropped
    frames.
  - u16 counter bounds are hardened and determinate total counts verified in
    discovery progress events.
  - The incomplete run copy and the missing `TransportLost` event coverage were
    fixed.
  - CLI vehicle identity gates are armed, with enforced lost-session recovery
    guards.
- **HIL vehicle behavior guardrails.**
  - **TCAM FD44 (HIL §4):** a length discriminator separates 4-byte and 7-byte
    layouts while 2048-byte dumps are quarantined as exploratory raw evidence,
    preventing false backup-battery failure alerts.
  - **ECM EE6F (HIL §5):** the 2-byte response is regression-locked as raw
    exploratory data, forbidding misinterpretation as accelerator pedal
    position.
  - **CEM C001 (HIL §6):** exploratory uncertainty is surfaced for key
    diagnostics instead of guessing registered key counts.
  - **Inventory cancellation (HIL §13):** inventory sweeps honor cooperative
    cancellation immediately between ECUs, tracking skipped modules without
    misclassifying them as absent.
  - **Stale response rejection (HIL §14):** a `ConnectionGeneration` monotonic
    latch in `RecoverySession` rejects stale frames from previous connection
    epochs after reconnect.
- **UI and layout polish.** Climate schematic SVG animations no longer fly
  across the canvas: transformations are eliminated and rotation centers are
  stabilized. Connection phase labels are clarified per target type (direct
  cable, bench, simulator). Theme density styling is resolved with consistent
  contrast across dark, light, and high-contrast themes, and rustdoc
  intra-doc links resolve for `InMemorySessionStore`.

### Security and privacy

- **Support bundle redaction (HIL §12).** Synthetic secrets, private IPs,
  credentials, email addresses, and vehicle serial numbers are scrubbed
  automatically (`[REDACTED-SERIAL]`), and decimal-degree latitude/longitude
  pairs are stripped (`[REDACTED-GPS]`) while two-decimal diagnostic readings
  (for example 390.0 V) stay intact.
- **Report location privacy.** GPS and position sections were removed from PPI
  reports entirely, and remaining exportable coordinates are rounded to 3
  decimal places (~110m) across export artifacts.
- **VIN-keyed storage hashing (DOIP-030).** Session profile hints and
  persistent caches are stored under files named by `SHA-256(VIN)`, so vehicle
  identity is not exposed in directory listings.

## 0.1.0 - 2026-09-01

First tagged release. The Tauri and React desktop client reaches parity with
(and replaces) the retired egui harness. The diagnostic core is hardened, and
CI gains real regression gates.

### Added

- **Observation envelope (OBS-001).** A versioned, `serde`-able
  `ObservationEnvelope` is the canonical serialisation of every decoded
  reading: value, state, source (ECU/service/DID), decoder id + version,
  evidence provenance, capture time, and raw reference. The battery report
  carries full per-channel provenance instead of flattened strings, and
  `ObservationV1` types are in the generated TypeScript contract.
- **Runtime capability manifest (SAFE-001).** `getCapabilities` returns an
  authoritative record of what the binary can actually do (write ops, DID
  scan, live, durable sessions); the UI gates on it instead of guessing from
  the presence of a command.
- **Live telemetry lifecycle (LIVE-001).** `startLive` streams real
  `operation-event`s at the requested interval with gap/rate accounting, a
  single-stream guard, precise per-operation `cancel`, and a `terminal` event.
- **Bounded DID scan** wired end-to-end (`startDidScan`).
- **Durable sessions (SESSION-001).** An atomic JSON-backed session store with
  operator notes, `listSessions`, corrupt-file recovery, and cross-restart
  persistence; the Sessions page renders real history.
- **DTC status decoding (DTC-001/002).** ISO 14229 status-byte breakdown, a
  unified searchable/filterable table, a null-safe freeze-frame inspector, and
  a capability-governed clear flow.
- **Vehicle and ECU detail routes** (`/vehicle`, `/ecus/:id`), multi-ECU
  odometer cross-check, and the Activity workspace.
- **Bundle budget gate (CODE-045).** Route- and locale-level code splitting
  plus `vendor-react` / `vendor-router` splits drop the entry chunk from
  428 kB to 158 kB; `scripts/gates/bundle-budget.mjs` fails CI on an
  initial-payload regression.
- **Centralised safe export/import** (`services/download.ts`) with a frontend
  wiring gate in CI.

### Changed

- The retired `crates/gui` egui harness was removed; the MSRV floor drops to
  1.88.
- FFI battery/vehicle reads route through the `application` use cases instead
  of hand-rolled decoders (CODE-004).
- Parasitic-drain and battery screens no longer apply unsupported diagnostic
  thresholds; measurements are described, not judged (POLICY-001).
- `RetryPolicy` and the deprecated `SqliteSessionStore` alias were removed.

### Fixed

- The freeze-frame decoder no longer fabricates a vehicle speed from framing
  bytes; unknown DID/record tags stop parsing instead of mis-aligning
  (CODE-003/010/021).
- The GPS decoder rejects out-of-range, non-finite, and null-island
  coordinates (CODE-018).
- Session notes are persisted instead of silently dropped (CODE-007).
- The `contracts_ts` drift test is line-ending independent (CODE-001).
- The session store surfaces disk-write failures instead of swallowing them.
- On Windows, physical Ethernet adapters are detected via `netdev`, and
  `build-desktop.sh` works from Git Bash.
