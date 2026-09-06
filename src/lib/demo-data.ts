/**
 * Deterministic mock values for the website's simulated openCMA interface.
 * These are illustrative figures chosen for the site. They are not a
 * reading from any vehicle.
 */

export const demoVehicle = {
  model: "Polestar 2",
  variant: "Long range, dual motor",
  modelYear: 2022,
  vin: "YV1ZZ••••••••••••",
  odometer: "41 208 km",
};

export const batteryDemo = {
  soh: 94.72,
  soc: 62,
  packVoltage: 398.6,
  packCurrent: -1.4,
  avgCellGroup: 3.721,
  minCellGroup: 3.716,
  maxCellGroup: 3.728,
  cellDelta: 12,
  tempMin: 21.4,
  tempMax: 24.9,
  capacityNominal: 78,
  capacityEstimated: 73.9,
  modules: 27,
  groupsPerModule: 4,
};

/** 108 potentials as offset in millivolts from the pack mean. Fixed set. */
export const cellOffsets: number[] = (() => {
  const seed = [
    2, -1, 0, 3, -2, 1, 4, -3, 2, 0, 1, -1, 5, -4, 2, 1, 0, -2, 3, 1,
    -1, 2, 6, -5, 1, 0, 2, -1, 3, -2, 1, 4, 0, -3, 2, 1, -1, 0, 3, -2,
    1, 2, -1, 5, -4, 0, 1, 2, -2, 3, 1, -1, 0, 4, -3, 1, 2, 0, -1, 3,
    -2, 1, 0, 2, -1, 4, -5, 1, 3, 0, -2, 1, 2, -1, 0, 3, 1, -3, 2, 0,
    -1, 1, 4, -2, 0, 2, 1, -1, 3, 0, -2, 1, 5, -4, 2, 0, 1, -1, 2, 3,
    -2, 0, 1, 2, -1, 0, 1, -3,
  ];
  return seed.slice(0, 108);
})();

/** Absolute voltage for potential i (module = floor(i/4)+1, group = i%4+1). */
export function cellVoltage(index: number): number {
  return Number((batteryDemo.avgCellGroup + cellOffsets[index] / 1000).toFixed(3));
}

/** Per-module temperature, deterministic, spread across the pack's range. */
export const moduleTemps: number[] = (() => {
  const { tempMin, tempMax, modules } = batteryDemo;
  const span = tempMax - tempMin;
  return Array.from({ length: modules }, (_, m) => {
    const s = Math.sin(m * 1.7) * 0.5 + 0.5;
    const drift = m > 18 ? 0.25 : 0; // rear modules run a touch warmer
    return Number((tempMin + span * (s * 0.8 + drift)).toFixed(1));
  });
})();

export type ModuleStats = {
  module: number;
  groups: { group: number; index: number; voltage: number; offset: number }[];
  avg: number;
  min: number;
  max: number;
  delta: number;
  temp: number;
};

export function moduleStats(module: number): ModuleStats {
  const start = (module - 1) * batteryDemo.groupsPerModule;
  const groups = Array.from({ length: batteryDemo.groupsPerModule }, (_, g) => {
    const index = start + g;
    return { group: g + 1, index, voltage: cellVoltage(index), offset: cellOffsets[index] };
  });
  const volts = groups.map((x) => x.voltage);
  const min = Math.min(...volts);
  const max = Math.max(...volts);
  const avg = Number((volts.reduce((a, b) => a + b, 0) / volts.length).toFixed(3));
  return {
    module,
    groups,
    avg,
    min,
    max,
    delta: Math.round((max - min) * 1000),
    temp: moduleTemps[module - 1],
  };
}

export const dtcDemo = [
  {
    ecu: "BECM",
    code: "P0A80-00",
    description: "Replace hybrid/EV battery pack",
    state: "stored" as const,
    snapshot: true,
    detail: "Capacity throughput threshold reached on module string 3. Recorded once, not currently active.",
  },
  {
    ecu: "BECM",
    code: "P1AF0-71",
    description: "Battery energy control module, cell balancing performance",
    state: "historical" as const,
    snapshot: false,
    detail: "Cleared after a balancing session. Retained in the historical log for evidence.",
  },
  {
    ecu: "CCM",
    code: "B1B25-13",
    description: "Evaporator temperature sensor, circuit open",
    state: "active" as const,
    snapshot: true,
    detail: "Present at time of scan. Confirmed on two consecutive drive cycles.",
  },
  {
    ecu: "TCAM",
    code: "U3003-16",
    description: "Battery voltage below threshold during telematics session",
    state: "pending" as const,
    snapshot: false,
    detail: "Seen once. Not yet matured to a confirmed fault.",
  },
];

export const dtcStateMeta = {
  active: { label: "Active", tone: "error", note: "Present now" },
  pending: { label: "Pending", tone: "warning", note: "Seen once, not confirmed" },
  stored: { label: "Stored", tone: "info", note: "Confirmed, recorded" },
  historical: { label: "Historical", tone: "muted", note: "Cleared, kept for evidence" },
} as const;

export const liveChannels = [
  { id: "pack_v", label: "Pack voltage", unit: "V", value: 398.6, min: 360, max: 410 },
  { id: "pack_a", label: "Pack current", unit: "A", value: -1.4, min: -220, max: 260 },
  { id: "batt_t", label: "Battery temperature", unit: "°C", value: 23.1, min: 10, max: 45 },
  { id: "inv_t", label: "Inverter temperature", unit: "°C", value: 34.7, min: 10, max: 80 },
  { id: "mot_nm", label: "Motor torque", unit: "N·m", value: 0, min: -120, max: 330 },
  { id: "lv_v", label: "12 V system", unit: "V", value: 14.2, min: 11, max: 15 },
];

/** One-minute trace for the live chart. Deterministic pseudo-random walk. */
export function liveTrace(points = 90): number[] {
  const out: number[] = [];
  let v = 398.6;
  let s = 20240517;
  for (let i = 0; i < points; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r = (s / 0x7fffffff - 0.5) * 1.6;
    v = Math.max(392, Math.min(404, v + r));
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

export const scanEcuOrder = [
  "CEM", "VGM", "VCU1", "BECM", "OBC", "IHFA", "IEM", "HVHA",
  "EPAS", "SAS", "BCM", "DIM", "IHU", "TCAM", "SRS", "CCM",
];

export const evidenceDemo = {
  before: { total: 12, active: 3, pending: 2, stored: 3, historical: 4 },
  after: { total: 2, active: 0, pending: 0, stored: 0, historical: 2 },
};
