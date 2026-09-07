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
  SPA: { label: "SPA", status: "wip" },
  SEA: { label: "SEA", status: "research" },
  SPA2: { label: "SPA2", status: "research" },
};

export type VehicleSupport = {
  manufacturer: "Polestar" | "Volvo" | "Zeekr";
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

const SPA_WIP: Partial<Record<Capability, CapStatus>> = {
  connection: "in-progress",
  "ecu-discovery": "in-progress",
  "dtc-scan": "none",
  "battery-soh": "not-verified",
  "cell-potentials": "none",
  "live-data": "none",
  "service-routines": "none",
};

const SEA_RESEARCH: Partial<Record<Capability, CapStatus>> = {
  connection: "in-progress",
  "ecu-discovery": "not-verified",
  "battery-soh": "not-verified",
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
    manufacturer: "Volvo",
    model: "XC60 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "wip",
    years: "2018 to present",
    note: "Plug-in hybrid. Platform recognised; ECU map and battery decoding in progress.",
    capabilities: SPA_WIP,
    research: ["DoIP discovery", "ECU mapping", "Battery data decoding"],
  },
  {
    manufacturer: "Volvo",
    model: "S60 / V60 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "wip",
    years: "2019 to present",
    capabilities: SPA_WIP,
    research: ["DoIP discovery", "ECU mapping"],
  },
  {
    manufacturer: "Volvo",
    model: "S90 / V90 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "research",
    years: "2018 to present",
    capabilities: { connection: "in-progress" },
    research: ["Gateway behaviour", "Routing activation"],
  },
  {
    manufacturer: "Volvo",
    model: "XC90 Recharge",
    platform: "SPA",
    powertrain: "PHEV",
    status: "research",
    years: "2016 to present",
    capabilities: { connection: "in-progress" },
    research: ["Gateway behaviour"],
  },

  {
    manufacturer: "Volvo",
    model: "EX30",
    platform: "SEA",
    powertrain: "BEV",
    status: "research",
    years: "2024 to present",
    note: "DoIP reachable. ECU map and battery decoding differ from CMA and are unverified.",
    capabilities: SEA_RESEARCH,
    research: ["Battery decoding", "ECU map differences from CMA"],
  },
  {
    manufacturer: "Polestar",
    model: "Polestar 4",
    platform: "SEA",
    powertrain: "BEV",
    status: "research",
    years: "2024 to present",
    capabilities: { connection: "in-progress" },
    research: ["Platform mapping under verification"],
  },
  {
    manufacturer: "Zeekr",
    model: "Zeekr 001 / 009 / X",
    platform: "SEA",
    powertrain: "BEV",
    status: "research",
    years: "2021 to present",
    note: "Related SEA architecture. Sub-platform mapping under verification.",
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
