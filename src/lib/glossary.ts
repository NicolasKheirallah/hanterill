/**
 * Glossary terms for the documentation and the surface UI. Each entry is the
 * expansion of an acronym a reader will meet, in plain language, plus the doc
 * page where it is used.
 *
 * Written for a reader who is comfortable with cars but not with diagnostics.
 * Where a term has a precise technical expansion, the expansion is given first
 * and the plain-language explanation second.
 */

export type GlossaryEntry = {
  /** Short form, as it appears in the UI and the docs. */
  term: string;
  /** Full expansion. */
  full: string;
  /** One sentence, plain language. */
  meaning: string;
  /** Grouping for the glossary page. */
  group: "Diagnostics" | "Protocols" | "Battery and high voltage" | "Modules" | "Platforms and bodies";
  /** Doc page where the term is used. */
  doc?: string;
};

export const glossaryGroups = [
  "Diagnostics",
  "Protocols",
  "Battery and high voltage",
  "Modules",
  "Platforms and bodies",
] as const;

export const glossary: GlossaryEntry[] = [
  // Diagnostics
  {
    term: "ECU",
    full: "Electronic Control Unit",
    meaning: "A small computer inside the car that runs one job, such as the brakes or the windows.",
    group: "Diagnostics",
    doc: "/docs/ecu-reference",
  },
  {
    term: "DTC",
    full: "Diagnostic Trouble Code",
    meaning: "A code a module stores when it detects a problem, printed as seven characters such as B171D57.",
    group: "Diagnostics",
    doc: "/docs/dtc-scanning",
  },
  {
    term: "DID",
    full: "Data Identifier",
    meaning: "A number used to ask a module for one specific value, such as its serial number or cell voltages.",
    group: "Diagnostics",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "SoH",
    full: "State of Health",
    meaning: "How much capacity a battery has left compared with when it was new, as a percentage.",
    group: "Diagnostics",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "SoC",
    full: "State of Charge",
    meaning: "How full the battery is right now, as a percentage of its current capacity.",
    group: "Diagnostics",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "PID",
    full: "Parameter Identifier",
    meaning: "A channel of live data that can be sampled on a schedule, such as pack current or motor speed.",
    group: "Diagnostics",
    doc: "/docs/live-telemetry",
  },
  {
    term: "NRC",
    full: "Negative Response Code",
    meaning: "The reason a module refused a request: unsupported service, wrong session, too busy, and so on.",
    group: "Diagnostics",
    doc: "/docs/dtc-scanning",
  },
  {
    term: "Freeze frame",
    full: "Stored snapshot record",
    meaning: "The conditions a module recorded at the moment a fault occurred, such as speed and temperature.",
    group: "Diagnostics",
    doc: "/docs/dtc-scanning",
  },
  {
    term: "Coverage",
    full: "Diagnostic coverage",
    meaning: "How many of the modules a scan planned to read actually answered, reported honestly including the failures.",
    group: "Diagnostics",
    doc: "/docs/workspace-tour",
  },
  {
    term: "EPB",
    full: "Electric Parking Brake",
    meaning: "The electronic handbrake, whose calipers can be retracted for pad or disc work.",
    group: "Diagnostics",
    doc: "/docs/safety",
  },

  // Protocols
  {
    term: "DoIP",
    full: "Diagnostics over Internet Protocol (ISO 13400)",
    meaning: "The standard that lets diagnostic messages travel over ordinary Ethernet to the car.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "UDS",
    full: "Unified Diagnostic Services (ISO 14229)",
    meaning: "The language of the questions: read a value, read fault codes, open a session, clear codes.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "ENET",
    full: "Ethernet diagnostic cable (OBD-II to RJ45)",
    meaning: "The passive copper cable that carries Ethernet from your laptop to the car's diagnostic port.",
    group: "Protocols",
    doc: "/docs/connection",
  },
  {
    term: "OBD-II",
    full: "On-Board Diagnostics, second generation",
    meaning: "The standard diagnostic socket under the dashboard, required on cars since the 1990s.",
    group: "Protocols",
    doc: "/docs/connection",
  },
  {
    term: "RJ45",
    full: "Registered Jack 45",
    meaning: "The standard Ethernet plug, the same one a home network cable uses.",
    group: "Protocols",
    doc: "/docs/connection",
  },
  {
    term: "TCP",
    full: "Transmission Control Protocol",
    meaning: "The reliable, ordered connection type. Diagnostic messages travel over TCP on port 13400.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "UDP",
    full: "User Datagram Protocol",
    meaning: "The fire-and-forget message type used to announce a vehicle on the local network.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "ISO",
    full: "International Organization for Standardization",
    meaning: "The body that publishes the standards this tool implements, such as ISO 13400 and ISO 14229.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "SAE",
    full: "Society of Automotive Engineers",
    meaning: "The body behind the fault-code naming standard (SAE J2012) that gives DTCs their letters and digits.",
    group: "Protocols",
    doc: "/docs/dtc-scanning",
  },
  {
    term: "LIN",
    full: "Local Interconnect Network",
    meaning: "A cheap, slow bus used for simple parts such as a door switch or a mirror.",
    group: "Protocols",
    doc: "/docs/architecture",
  },
  {
    term: "CAN",
    full: "Controller Area Network",
    meaning: "The classic in-car bus. Some older platforms serve battery data over it rather than over Ethernet.",
    group: "Protocols",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "VIN",
    full: "Vehicle Identification Number",
    meaning: "The car's 17-character identity, masked in exports by default.",
    group: "Protocols",
    doc: "/docs/privacy",
  },
  {
    term: "OTA",
    full: "Over-the-Air",
    meaning: "A software update delivered remotely rather than at a workshop.",
    group: "Protocols",
    doc: "/docs/firmware-and-inventory",
  },

  // Battery and high voltage
  {
    term: "BECM",
    full: "Battery Energy Control Module",
    meaning: "The computer that manages the traction battery and reports its health, charge and cell voltages.",
    group: "Battery and high voltage",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "BMS",
    full: "Battery Monitoring Sensor",
    meaning: "The sensor on the 12 V battery that reports its state to the car.",
    group: "Battery and high voltage",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "HV",
    full: "High Voltage",
    meaning: "The several-hundred-volt system that drives the motors. Hazardous, and never to be touched without training.",
    group: "Battery and high voltage",
    doc: "/docs/safety",
  },
  {
    term: "Cell group",
    full: "Series cell group",
    meaning: "A set of battery cells wired in series that the module reports as one voltage, the unit the cell matrix shows.",
    group: "Battery and high voltage",
    doc: "/docs/battery-diagnostics",
  },
  {
    term: "OBC",
    full: "On-Board Charger",
    meaning: "The module that converts AC mains into DC to charge the pack.",
    group: "Battery and high voltage",
    doc: "/docs/ecu-reference",
  },
  {
    term: "IHFA",
    full: "Inverter, High voltage Front Axle",
    meaning: "The module that turns battery DC into motor drive current for the front axle.",
    group: "Battery and high voltage",
    doc: "/docs/ecu-reference",
  },
  {
    term: "IEM",
    full: "Inverter, ERAD Module",
    meaning: "The inverter for the rear axle motor (ERAD: Electric Rear Axle Drive).",
    group: "Battery and high voltage",
    doc: "/docs/ecu-reference",
  },
  {
    term: "HVAC",
    full: "Heating, Ventilation and Air Conditioning",
    meaning: "The climate system: heat pump, heater circuit, compressor and blend doors.",
    group: "Battery and high voltage",
    doc: "/docs/workspace-tour",
  },

  // Modules
  {
    term: "CEM",
    full: "Central Electronic Module",
    meaning: "The car's central body computer, which also holds the gateway to the diagnostic network.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "VGM",
    full: "Vehicle Gateway Module",
    meaning: "The firewall between the outside diagnostic connection and the car's internal networks.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "TCAM",
    full: "Telematics and Connectivity Antenna Module",
    meaning: "The module that carries the cellular modem, GNSS position and the emergency backup battery.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "IHU",
    full: "Infotainment Head Unit",
    meaning: "The main screen computer (Android Automotive on the reference platform).",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "VCU1",
    full: "Vehicle Control Unit 1",
    meaning: "The module that coordinates drive and torque across the axles.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "DIM",
    full: "Driver Information Module",
    meaning: "The instrument cluster behind the steering wheel, and the keeper of the service counter.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "SRS",
    full: "Supplemental Restraint System",
    meaning: "The airbag and restraint controllers. A live fault here is treated as safety-critical.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "BCM2",
    full: "Brake Control Module 2",
    meaning: "The ABS, stability control and parking-brake controller.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "PSCM",
    full: "Power Steering Control Module",
    meaning: "The electric power steering controller.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "SAS",
    full: "Steering Angle Sensor",
    meaning: "The sensor that reports how far and how fast the wheel is turned.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "ASDM",
    full: "Active Safety Domain Master",
    meaning: "The module that fuses camera and radar data for driver-assistance features.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "ADAS",
    full: "Advanced Driver Assistance Systems",
    meaning: "The driver-assistance features: forward camera, radar, surround view and their calibration.",
    group: "Modules",
    doc: "/docs/safety",
  },
  {
    term: "ECM",
    full: "Engine Control Module",
    meaning: "The combustion engine controller. Present on the hybrid and PHEV variants, silent on a BEV.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },
  {
    term: "TCM",
    full: "Transmission Control Module",
    meaning: "The gearbox controller on combustion and hybrid variants.",
    group: "Modules",
    doc: "/docs/ecu-reference",
  },

  // Platforms and bodies
  {
    term: "CMA",
    full: "Compact Modular Architecture",
    meaning: "The platform under the Polestar 2 and the smaller electric Volvos, and the one Hanterill was built on.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "SPA",
    full: "Scalable Product Architecture",
    meaning: "The larger Volvo platform, mostly plug-in hybrids. Catalogued, not yet verified live.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "SEA",
    full: "Sustainable Experience Architecture",
    meaning: "The Geely-family electric platform under the EX30 class. Definitions exist, hardware confirmation does not.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "SPA2",
    full: "Second-generation Scalable Product Architecture",
    meaning: "The newest large platform (EX90, Polestar 3). Under investigation, not usable for diagnostics.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "BEV",
    full: "Battery Electric Vehicle",
    meaning: "A car driven purely by a battery and electric motors, with no combustion engine.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "PHEV",
    full: "Plug-in Hybrid Electric Vehicle",
    meaning: "A car with both a combustion engine and a chargeable battery.",
    group: "Platforms and bodies",
    doc: "/docs/supported-vehicles",
  },
  {
    term: "ICE",
    full: "Internal Combustion Engine",
    meaning: "A petrol or diesel engine. The CMA platform has hybrid variants, so the engine side is catalogued too.",
    group: "Platforms and bodies",
    doc: "/docs/ecu-reference",
  },
  {
    term: "GNSS",
    full: "Global Navigation Satellite System",
    meaning: "The satellite positioning system (GPS and its siblings) reported by the telematics module.",
    group: "Platforms and bodies",
    doc: "/docs/workspace-tour",
  },
];

/** Look up one term, case-insensitively. */
export function findTerm(term: string): GlossaryEntry | undefined {
  const want = term.toLowerCase();
  return glossary.find((e) => e.term.toLowerCase() === want);
}
