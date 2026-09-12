/**
 * Vehicle support data. "Platform compatibility" (Hanterill can reach the car over
 * DoIP) is not the same as "verified support" (functions are implemented and
 * checked). Status labels below always reflect verified support, never platform
 * membership. No completion percentages are invented.
 */

export type SupportStatus = "supported" | "partial" | "testing" | "wip" | "research" | "planned";

type Tone = "ok" | "warning" | "info" | "muted";

// Label and note text for every status lives in the message catalog
// (platforms.status / platforms.statusNotes). Only the tone is structural.
export const statusMeta: Record<SupportStatus, { tone: Tone }> = {
  supported: { tone: "ok" },
  partial: { tone: "warning" },
  testing: { tone: "warning" },
  wip: { tone: "info" },
  research: { tone: "info" },
  planned: { tone: "muted" },
};

export type Capability =
  | "connection"
  | "ecu-discovery"
  | "dtc-scan"
  | "battery-soh"
  | "cell-potentials"
  | "live-data"
  | "service-routines";

export type CapStatus = "supported" | "partial" | "in-progress" | "not-verified" | "none";

// Capability names (platforms.capLabels) and status text (platforms.capStatus)
// are in the message catalog; only the tone is structural.
export const capStatusMeta: Record<CapStatus, { tone: Tone }> = {
  supported: { tone: "ok" },
  partial: { tone: "warning" },
  "in-progress": { tone: "info" },
  "not-verified": { tone: "info" },
  none: { tone: "muted" },
};

export type Platform = "CMA" | "SPA" | "SEA" | "SPA2";

// Blurb text per platform is in the message catalog (platforms.blurbs).
export const platformMeta: Record<Platform, { label: string; status: SupportStatus }> = {
  CMA: { label: "CMA", status: "supported" },
  SPA: { label: "SPA", status: "testing" },
  SEA: { label: "SEA", status: "testing" },
  SPA2: { label: "SPA2", status: "research" },
};

export type VehicleSupport = {
  manufacturer: "Polestar" | "Volvo" | "Zeekr" | "Lynk & Co";
  model: string;
  platform: Platform;
  powertrain: "BEV" | "PHEV";
  status: SupportStatus;
  years: string;
  note?: string;
  capabilities: Partial<Record<Capability, CapStatus>>;
  research?: string[];
};

const CMA_FULL: Record<Capability, CapStatus> = {
  connection: "supported",
  "ecu-discovery": "supported",
  "dtc-scan": "supported",
  "battery-soh": "supported",
  "cell-potentials": "supported",
  "live-data": "supported",
  "service-routines": "partial",
};

const SPA_TESTING: Partial<Record<Capability, CapStatus>> = {
  connection: "in-progress",
  "ecu-discovery": "not-verified",
  "dtc-scan": "none",
  "battery-soh": "not-verified",
  "cell-potentials": "not-verified",
  "live-data": "none",
  "service-routines": "none",
};

const SEA_TESTING: Partial<Record<Capability, CapStatus>> = {
  connection: "in-progress",
  "ecu-discovery": "not-verified",
  "battery-soh": "not-verified",
  "cell-potentials": "not-verified",
};

export const vehicles: VehicleSupport[] = [
  {
    manufacturer: "Polestar",
    model: "Polestar 2",
    platform: "CMA",
    powertrain: "BEV",
    status: "supported",
    years: "2021 to present",
    note: "Single- and dual-motor. 108-potential battery layout, 27 modules by 4 groups.",
    capabilities: CMA_FULL,
  },
  {
    manufacturer: "Volvo",
    model: "XC40 Recharge / EX40",
    platform: "CMA",
    powertrain: "BEV",
    status: "supported",
    years: "2021 to present",
    note: "Shares the CMA high-voltage architecture with Polestar 2.",
    capabilities: CMA_FULL,
  },
  {
    manufacturer: "Volvo",
    model: "C40 Recharge / EC40",
    platform: "CMA",
    powertrain: "BEV",
    status: "supported",
    years: "2022 to present",
    capabilities: CMA_FULL,
  },
  {
    manufacturer: "Lynk & Co",
    model: "01 / 02 / 05",
    platform: "CMA",
    powertrain: "PHEV",
    status: "research",
    years: "2020 to present",
    note: "CMA family, plug-in hybrid and electric variants. The hybrid pack layout differs from the CMA BEV reference vehicle and is not verified.",
    capabilities: { connection: "in-progress" },
    research: ["Pack layout", "ECU map", "Live sessions"],
  },

  {
    manufacturer: "Volvo",
    model: "XC60 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "testing",
    years: "2018 to present",
    note: "T8 plug-in hybrid. The 102-cell hybrid pack topology, CAN-era BECM map and decoders are in the catalogue; no live-vehicle verification yet.",
    capabilities: SPA_TESTING,
    research: ["Live battery sessions", "ECU mapping"],
  },
  {
    manufacturer: "Volvo",
    model: "S60 / V60 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "testing",
    years: "2019 to present",
    capabilities: SPA_TESTING,
    research: ["Live battery sessions"],
  },
  {
    manufacturer: "Volvo",
    model: "S90 / V90 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "testing",
    years: "2018 to present",
    capabilities: SPA_TESTING,
    research: ["Gateway behaviour", "Live battery sessions"],
  },
  {
    manufacturer: "Volvo",
    model: "XC90 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "testing",
    years: "2016 to present",
    capabilities: SPA_TESTING,
    research: ["Gateway behaviour", "Live battery sessions"],
  },

  {
    manufacturer: "Volvo",
    model: "EX30",
    platform: "SEA",
    powertrain: "BEV",
    status: "testing",
    years: "2024 to present",
    note: "SEA1 catalogue defined (ECU registry, DoIP routing addresses, BECM DID maps, cell mapping). Nothing is hardware-confirmed yet; treat any reading as provisional.",
    capabilities: SEA_TESTING,
    research: ["Hardware confirmation of the DID maps", "Software and battery variant matrix"],
  },
  {
    manufacturer: "Polestar",
    model: "Polestar 4",
    platform: "SEA",
    powertrain: "BEV",
    status: "testing",
    years: "2024 to present",
    note: "Covered by the SEA1 platform definitions. No live-vehicle verification yet.",
    capabilities: SEA_TESTING,
    research: ["Live sessions", "Variant matrix"],
  },
  {
    manufacturer: "Zeekr",
    model: "Zeekr 001 / 009 / X",
    platform: "SEA",
    powertrain: "BEV",
    status: "research",
    years: "2021 to present",
    note: "SEA family. The EX30 catalogue is deliberately not applied to Zeekr on family resemblance; sub-platform mapping must be confirmed first.",
    capabilities: { connection: "not-verified" },
    research: ["Sub-platform mapping", "Gateway and security model"],
  },

  {
    manufacturer: "Volvo",
    model: "EX90",
    platform: "SPA2",
    powertrain: "BEV",
    status: "research",
    years: "2024 to present",
    capabilities: { connection: "in-progress" },
    research: ["Gateway and security model", "Routing activation"],
  },
  {
    manufacturer: "Polestar",
    model: "Polestar 3",
    platform: "SPA2",
    powertrain: "BEV",
    status: "research",
    years: "2024 to present",
    capabilities: { connection: "in-progress" },
    research: ["Gateway and security model"],
  },
];

export const platformsInOrder: Platform[] = ["CMA", "SPA", "SEA", "SPA2"];

/** Stable DOM anchor for a vehicle row (deep links and the palette share it). */
export function vehicleAnchor(v: Pick<VehicleSupport, "manufacturer" | "model">) {
  return `${v.manufacturer}-${v.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Coarse bucket used by the vehicles-page filter chips. */
export type SupportBucket = "tested" | "catalogued" | "exploring";

export function supportBucket(s: SupportStatus): SupportBucket {
  if (s === "supported" || s === "partial") return "tested";
  if (s === "testing") return "catalogued";
  return "exploring";
}
