import { ecus, ecuStats } from "@/lib/ecus";

/**
 * Deterministic simulated diagnostic session for the website. Timings and fault
 * records are fixed sample data. Nothing here is read from a vehicle.
 */

export type ScanStage = "idle" | "discovering" | "detected" | "routing" | "scanning" | "complete";

/** Message-catalog key (scan namespace) for each stage. */
export const stageKey: Record<ScanStage, string> = {
  idle: "stageIdle",
  discovering: "stageDiscovering",
  detected: "stageDetected",
  routing: "stageRouting",
  scanning: "stageScanning",
  complete: "stageComplete",
};

export type SimFault = {
  code: string;
  /** `demo.faultTitles` key is the `code`; `demo.<lastSeenKey>` gives the age text. */
  status: "stored" | "historical" | "pending";
  lastSeenKey: "lastSeen12Min" | "lastSeen3Cycles" | "lastSeenThisCycle";
  snapshot: boolean;
};

export type SimEcu = {
  code: string;
  name: string;
  /** ms after scan start when this ECU responds */
  at: number;
  faults: SimFault[];
};

// Every catalogued ECU answers in the simulated scan. Response order is the
// catalogue order; the per-ECU jitter is a baked deterministic stride, not
// random. The shortened animation cadence keeps the full sweep watchable.
const CADENCE = 85;
const STRIDE = 37;

const FAULTS: Record<string, SimFault[]> = {
  BECM: [{ code: "P1A2E-71", status: "stored", lastSeenKey: "lastSeen12Min", snapshot: true }],
  TCAM: [{ code: "U110B-87", status: "historical", lastSeenKey: "lastSeen3Cycles", snapshot: false }],
  CCM: [{ code: "B1C15-13", status: "pending", lastSeenKey: "lastSeenThisCycle", snapshot: true }],
};

export const STAGE_TIMES = {
  discovering: 0,
  detected: 900,
  routing: 1500,
  scanning: 2100,
};

export const simEcus: SimEcu[] = ecus.map((e, i) => ({
  code: e.code,
  name: e.name,
  at: STAGE_TIMES.scanning + 260 + i * CADENCE + ((i * STRIDE) % CADENCE),
  faults: FAULTS[e.code] ?? [],
}));

export const SCAN_END = simEcus[simEcus.length - 1].at + 500;

export const scanTotals = {
  discovered: ecuStats.discovered,
  dtcCapable: ecuStats.dtc,
  modulesWithFaults: Object.keys(FAULTS).length,
  faults: Object.values(FAULTS).reduce((n, f) => n + f.length, 0),
};

export function stageAt(elapsed: number): ScanStage {
  if (elapsed <= 0) return "idle";
  if (elapsed >= SCAN_END) return "complete";
  if (elapsed >= STAGE_TIMES.scanning) return "scanning";
  if (elapsed >= STAGE_TIMES.routing) return "routing";
  if (elapsed >= STAGE_TIMES.detected) return "detected";
  return "discovering";
}
