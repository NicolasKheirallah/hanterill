import { ecus } from "@/lib/ecus";

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

// Order and cadence are fixed; the small per-ECU jitter is baked in, not random.
const ORDER = ["CEM", "VGM", "VCU1", "BECM", "OBC", "IHFA", "IEM", "BCM", "EPAS", "SAS", "DIM", "IHU", "TCAM", "SRS", "CCM"];
const JITTER = [0, 40, 20, 90, 55, 30, 70, 25, 60, 15, 80, 35, 50, 20, 45];

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

export const simEcus: SimEcu[] = ORDER.map((code, i) => {
  const meta = ecus.find((e) => e.code === code);
  return {
    code,
    name: meta?.name ?? code,
    at: STAGE_TIMES.scanning + 260 + i * 230 + JITTER[i % JITTER.length],
    faults: FAULTS[code] ?? [],
  };
});

export const SCAN_END = simEcus[simEcus.length - 1].at + 500;

export const scanTotals = {
  discovered: 43,
  diagnostic: 34,
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
