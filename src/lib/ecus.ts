/**
 * ECU reference for the CMA electric platform. Acronyms, full names and
 * part numbers follow the published Polestar 2 / CMA wiring documentation.
 * Grouping mirrors how the vehicle network is laid out around the gateway.
 */
export type Ecu = {
  code: string;
  name: string;
  partNumber?: string;
  domain: "gateway" | "energy" | "chassis" | "cabin";
  diagnostic: boolean;
};

export const ecus: Ecu[] = [
  { code: "CEM", name: "Central Electronic Module", partNumber: "32320214", domain: "gateway", diagnostic: true },
  { code: "VGM", name: "Vehicle Gateway Module", partNumber: "36003604", domain: "gateway", diagnostic: true },
  { code: "VCU1", name: "Vehicle Computational Unit 1", partNumber: "32350312", domain: "gateway", diagnostic: true },

  { code: "BECM", name: "Battery Energy Control Module", partNumber: "32290432", domain: "energy", diagnostic: true },
  { code: "OBC", name: "On-Board Charger", partNumber: "36003389", domain: "energy", diagnostic: true },
  { code: "IHFA", name: "Inverter, High Voltage, Front Axle", domain: "energy", diagnostic: true },
  { code: "IEM", name: "Inverter, ERAD Module", domain: "energy", diagnostic: true },
  { code: "HVHA", name: "High-Voltage Coolant Heater", domain: "energy", diagnostic: true },
  { code: "ACCA", name: "Air-Conditioning Compressor Module", domain: "energy", diagnostic: true },
  { code: "EFAD", name: "Electric Front Axle Drive", domain: "energy", diagnostic: false },
  { code: "ERAD", name: "Electric Rear Axle Drive", domain: "energy", diagnostic: false },

  { code: "EPAS", name: "Electric Power-Assisted Steering", partNumber: "36010599", domain: "chassis", diagnostic: true },
  { code: "SAS", name: "Steering Angle Sensor", domain: "chassis", diagnostic: true },
  { code: "SCL", name: "Steering Column Lock", partNumber: "32246209", domain: "chassis", diagnostic: true },
  { code: "EGSM", name: "Electronic Gear Selector Module", partNumber: "31492589", domain: "chassis", diagnostic: true },
  { code: "BCM", name: "Brake Control Module", domain: "chassis", diagnostic: true },
  { code: "WAM", name: "Wide-Angle Vision Module", domain: "chassis", diagnostic: true },

  { code: "DIM", name: "Driver Information Module", partNumber: "36003414", domain: "cabin", diagnostic: true },
  { code: "IHU", name: "Infotainment Head Unit", partNumber: "36012873", domain: "cabin", diagnostic: true },
  { code: "CCD", name: "Centre Console Display", domain: "cabin", diagnostic: true },
  { code: "SWM", name: "Steering Wheel Module", partNumber: "31674383", domain: "cabin", diagnostic: true },
  { code: "TCAM", name: "Telematics and Connectivity Antenna Module", partNumber: "36003394", domain: "cabin", diagnostic: true },
  { code: "ATM", name: "Auxiliary Telematics Module", domain: "cabin", diagnostic: true },
  { code: "AUD", name: "Audio Amplifier Module", partNumber: "32265526", domain: "cabin", diagnostic: true },
  { code: "SRS", name: "Supplemental Restraint System", domain: "cabin", diagnostic: true },
  { code: "CCM", name: "Climate Control Module", domain: "cabin", diagnostic: true },
];

// Domain labels and blurbs live in the message catalog (ecuTopology.domains /
// ecuTopology.domainBlurbs).

export const ecuStats = {
  discovered: ecus.length,
  diagnostic: ecus.filter((e) => e.diagnostic).length,
};
