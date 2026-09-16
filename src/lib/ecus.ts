/**
 * ECU reference for the CMA electric platform. Codes and names follow the
 * application's module catalogue: 49 registry entries, 40 of them DTC-capable.
 * Addresses are the DoIP logical addresses from the same registry. Part
 * numbers are shown only where published documentation lists them. Grouping
 * mirrors how the vehicle network is laid out around the gateway.
 *
 * Five entries (TCM, DEM, NRCM, MVBM, SUM) are ICE/PHEV reference rows:
 * registered from vendor reference data that still needs testing on more cars,
 * and `variant: true` marks them as such. On a BEV they simply stay
 * silent, and a presence timeout is expected rather than a fault.
 */
export type Ecu = {
  domain: "gateway" | "energy" | "chassis" | "cabin";
  /** DoIP logical address, as used in the diagnostic message header. */
  address: string;
  code: string;
  name: string;
  partNumber?: string;
  /** Answers a UDS diagnostic session. */
  diagnostic: boolean;
  /** Advertises DTC support (ReadDTCInformation). */
  dtc: boolean;
  /** Reference-data row that still needs testing on more cars. */
  variant?: boolean;
};

export const ecus: Ecu[] = [
  { address: "0x1002", code: "VGM", name: "Vehicle Gateway Module", partNumber: "36003604", domain: "gateway", diagnostic: true, dtc: true },
  { address: "0x1A01", code: "CEM", name: "Central Electronic Module", partNumber: "32320214", domain: "gateway", diagnostic: true, dtc: true },

  { address: "0x1602", code: "VCU1", name: "Vehicle Control Unit 1", partNumber: "32350312", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1635", code: "BECM", name: "Battery Energy Control Module", partNumber: "32290432", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1B61", code: "BMS", name: "Battery Monitoring Sensor", domain: "energy", diagnostic: true, dtc: false },
  { address: "0x1634", code: "OBC", name: "On-Board Charger", partNumber: "36003389", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1692", code: "IHFA", name: "Inverter High Voltage Front Axle", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1637", code: "IEM", name: "Inverter ERAD Module", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1630", code: "ECM", name: "Engine Control Module", domain: "energy", diagnostic: true, dtc: true },
  { address: "0x1632", code: "TCM", name: "Transmission Control Module", domain: "energy", diagnostic: true, dtc: true, variant: true },
  { address: "0x1638", code: "DEM", name: "Differential Electronic Module", domain: "energy", diagnostic: true, dtc: true, variant: true },
  { address: "0x1652", code: "MVBM", name: "Mid Voltage Battery Monitor", domain: "energy", diagnostic: true, dtc: true, variant: true },
  { address: "0x163D", code: "NRCM", name: "Nox Reducing Control Module", domain: "energy", diagnostic: true, dtc: true, variant: true },

  { address: "0x16A1", code: "BCM2", name: "Brake Control Module 2", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1612", code: "PSCM", name: "Power Steering Control Module", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1616", code: "SAS", name: "Steering Angle Sensor", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1615", code: "SCL", name: "Steering Column Lock", partNumber: "32246209", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1614", code: "SUM", name: "Suspension Module", domain: "chassis", diagnostic: true, dtc: true, variant: true },
  { address: "0x1633", code: "EGSM", name: "Electric Gear Selector Module", partNumber: "31492589", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1B52", code: "IMS", name: "Inertial Measurement Sensor", domain: "chassis", diagnostic: true, dtc: false },
  { address: "0x1401", code: "ASDM", name: "Active Safety Domain Master", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1421", code: "FLC2", name: "Forward Looking Camera 2", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1451", code: "FLR", name: "Forward Looking Radar", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1431", code: "WAM", name: "Wide-Angle Module", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1221", code: "PAC", name: "Park Assist Camera", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1432", code: "SODL", name: "Side Obstacle Detection Left", domain: "chassis", diagnostic: true, dtc: true },
  { address: "0x1433", code: "SODR", name: "Side Obstacle Detection Right", domain: "chassis", diagnostic: true, dtc: true },

  { address: "0x1801", code: "DIM", name: "Driver Information Module", partNumber: "36003414", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1A11", code: "CCM", name: "Climate Control Module", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1021", code: "TCAM", name: "Telematics Connectivity Antenna Module", partNumber: "36003394", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1C01", code: "SRS", name: "Supplemental Restraint System", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1201", code: "IHU", name: "Infotainment Head Unit", partNumber: "36012873", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1241", code: "CSD", name: "Center Screen Display", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1212", code: "AUD", name: "Audio Module", partNumber: "32265526", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1B91", code: "SWM", name: "Steering Wheel Module", partNumber: "31674383", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1A12", code: "DDM", name: "Driver Door Module", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1A13", code: "PDM", name: "Passenger Door Module", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1A15", code: "POT", name: "Power Operated Tailgate", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1416", code: "RML", name: "Rear Module Left", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1417", code: "RMR", name: "Rear Module Right", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1BB3", code: "HCML", name: "Headlight Control Module Left", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1BB4", code: "HCMR", name: "Headlight Control Module Right", domain: "cabin", diagnostic: true, dtc: true },
  { address: "0x1BBA", code: "PXMR", name: "Pixel Module Right", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1BBC", code: "PXML", name: "Pixel Module Left", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1B22", code: "OHC", name: "Overhead Console", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1B31", code: "PAKM", name: "Phone-As-Key Module", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1B41", code: "WPC", name: "Wireless Phone Charger", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x1B51", code: "BBS", name: "Battery Backed-up Sounder", domain: "cabin", diagnostic: true, dtc: false },
  { address: "0x163A", code: "ESM", name: "Exterior Sound Module", domain: "cabin", diagnostic: true, dtc: true },
];

// Domain labels and blurbs live in the message catalog (ecuTopology.domains /
// ecuTopology.domainBlurbs).

export const ecuStats = {
  registered: ecus.length,
  diagnostic: ecus.filter((e) => e.diagnostic).length,
  dtc: ecus.filter((e) => e.dtc).length,
  /** Live-observed registry rows, excluding the ICE/PHEV reference rows. */
  observed: ecus.filter((e) => !e.variant).length,
};
