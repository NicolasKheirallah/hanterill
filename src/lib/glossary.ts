/** Expansions for the engineering acronyms surfaced in the UI. */
export const glossary: Record<string, { full: string; doc?: string }> = {
  BECM: { full: "Battery Energy Control Module", doc: "/docs/battery-diagnostics" },
  CEM: { full: "Central Electronic Module", doc: "/docs/ecu-reference" },
  VGM: { full: "Vehicle Gateway Module", doc: "/docs/ecu-reference" },
  DoIP: { full: "Diagnostics over Internet Protocol (ISO 13400)", doc: "/docs/architecture" },
  UDS: { full: "Unified Diagnostic Services (ISO 14229)", doc: "/docs/architecture" },
  DTC: { full: "Diagnostic Trouble Code", doc: "/docs/dtc-scanning" },
  SoH: { full: "State of Health", doc: "/docs/battery-diagnostics" },
  SoC: { full: "State of Charge", doc: "/docs/battery-diagnostics" },
  ENET: { full: "Ethernet diagnostic cable, OBD-II to RJ45", doc: "/docs/connection" },
  ECU: { full: "Electronic Control Unit", doc: "/docs/ecu-reference" },
  TCAM: { full: "Telematics and Connectivity Antenna Module", doc: "/docs/ecu-reference" },
};
