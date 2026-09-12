/**
 * ECU reference for the CMA electric platform. Codes and names follow the
 * application's module catalogue (43 catalogued ECUs, 34 of which advertise
 * DTC support). Part numbers are shown only where published documentation
 * lists them. Grouping mirrors how the vehicle network is laid out around
 * the gateway.
 */
export type Ecu = {
  domain: "gateway" | "energy" | "chassis" | "cabin";
  code: string;
  name: string;
  partNumber?: string;
  diagnostic: boolean;
  dtc: boolean;
};

export const ecus: Ecu[] = [
  { code: "CEM", name: "Central Electronic Module", partNumber: "32320214", domain: "gateway", diagnostic: true, dtc: true },
  { code: "VGM", name: "Vehicle Gateway Module", partNumber: "36003604", domain: "gateway", diagnostic: true, dtc: true },

  { code: "BECM", name: "Battery Energy Control Module", partNumber: "32290432", domain: "energy", diagnostic: true, dtc: true },
  { code: "VCU1", name: "Vehicle Control Unit 1", partNumber: "32350312", domain: "energy", diagnostic: true, dtc: true },
  { code: "IHFA", name: "Inverter High Voltage Front Axle", domain: "energy", diagnostic: true, dtc: true },
  { code: "IEM", name: "Inverter ERAD Module", domain: "energy", diagnostic: true, dtc: true },
  { code: "OBC", name: "On-Board Charger", partNumber: "36003389", domain: "energy", diagnostic: true, dtc: true },
  { code: "ECM", name: "Engine Control Module", domain: "energy", diagnostic: true, dtc: true },
  { code: "BMS", name: "Battery Monitoring Sensor", domain: "energy", diagnostic: true, dtc: false },

  { code: "BCM2", name: "Brake Control Module 2", domain: "chassis", diagnostic: true, dtc: true },
  { code: "PSCM", name: "Power Steering Control Module", domain: "chassis", diagnostic: true, dtc: true },
  { code: "SAS", name: "Steering Angle Sensor", domain: "chassis", diagnostic: true, dtc: true },
  { code: "SCL", name: "Steering Column Lock", partNumber: "32246209", domain: "chassis", diagnostic: true, dtc: true },
  { code: "EGSM", name: "Electric Gear Selector Module", partNumber: "31492589", domain: "chassis", diagnostic: true, dtc: true },
  { code: "ASDM", name: "Active Safety Domain Master", domain: "chassis", diagnostic: true, dtc: true },
  { code: "FLC2", name: "Forward Looking Camera 2", domain: "chassis", diagnostic: true, dtc: true },
  { code: "FLR", name: "Forward Looking Radar", domain: "chassis", diagnostic: true, dtc: true },
  { code: "WAM", name: "Wide-Angle Module", domain: "chassis", diagnostic: true, dtc: true },
  { code: "SODL", name: "Side Obstacle Detection Left", domain: "chassis", diagnostic: true, dtc: true },
  { code: "SODR", name: "Side Obstacle Detection Right", domain: "chassis", diagnostic: true, dtc: true },
  { code: "IMS", name: "Inertial Measurement Sensor", domain: "chassis", diagnostic: true, dtc: false },

  { code: "DIM", name: "Driver Information Module", partNumber: "36003414", domain: "cabin", diagnostic: true, dtc: true },
  { code: "CCM", name: "Climate Control Module", domain: "cabin", diagnostic: true, dtc: true },
  { code: "TCAM", name: "Telematics Connectivity Antenna Module", partNumber: "36003394", domain: "cabin", diagnostic: true, dtc: true },
  { code: "SRS", name: "Supplemental Restraint System", domain: "cabin", diagnostic: true, dtc: true },
  { code: "IHU", name: "Infotainment Head Unit", partNumber: "36012873", domain: "cabin", diagnostic: true, dtc: true },
  { code: "CSD", name: "Center Screen Display", domain: "cabin", diagnostic: true, dtc: true },
  { code: "AUD", name: "Audio Module", partNumber: "32265526", domain: "cabin", diagnostic: true, dtc: true },
  { code: "SWM", name: "Steering Wheel Module", partNumber: "31674383", domain: "cabin", diagnostic: true, dtc: false },
  { code: "DDM", name: "Driver Door Module", domain: "cabin", diagnostic: true, dtc: true },
  { code: "PDM", name: "Passenger Door Module", domain: "cabin", diagnostic: true, dtc: true },
  { code: "POT", name: "Power Operated Tailgate", domain: "cabin", diagnostic: true, dtc: true },
  { code: "RML", name: "Rear Module Left", domain: "cabin", diagnostic: true, dtc: true },
  { code: "RMR", name: "Rear Module Right", domain: "cabin", diagnostic: true, dtc: true },
  { code: "HCML", name: "Headlight Control Module Left", domain: "cabin", diagnostic: true, dtc: true },
  { code: "HCMR", name: "Headlight Control Module Right", domain: "cabin", diagnostic: true, dtc: true },
  { code: "PXMR", name: "Pixel Module Right", domain: "cabin", diagnostic: true, dtc: false },
  { code: "PXML", name: "Pixel Module Left", domain: "cabin", diagnostic: true, dtc: false },
  { code: "OHC", name: "Overhead Console", domain: "cabin", diagnostic: true, dtc: false },
  { code: "PAKM", name: "Phone-As-Key Module", domain: "cabin", diagnostic: true, dtc: false },
  { code: "WPC", name: "Wireless Phone Charger", domain: "cabin", diagnostic: true, dtc: false },
  { code: "BBS", name: "Battery Backed-up Sounder", domain: "cabin", diagnostic: true, dtc: false },
  { code: "ESM", name: "Exterior Sound Module", domain: "cabin", diagnostic: true, dtc: true },
];

// Domain labels and blurbs live in the message catalog (ecuTopology.domains /
// ecuTopology.domainBlurbs).

export const ecuStats = {
  discovered: ecus.length,
  diagnostic: ecus.filter((e) => e.diagnostic).length,
  dtc: ecus.filter((e) => e.dtc).length,
};
