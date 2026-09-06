import { ecus } from "@/lib/ecus";

/**
 * Deterministic simulated diagnostic session for the website. Timings and fault
 * records are fixed sample data. Nothing here is read from a vehicle.
 */

export type ScanStage = "idle" | "discovering" | "detected" | "routing" | "scanning" | "complete";

export const stageLabel: Record<ScanStage, string> = {
  idle: "Idle",
  discovering: "Discovering vehicle",
  detected: "Vehicle detected",
  routing: "Activating diagnostic route",
  scanning: "Scanning ECUs",
  complete: "Scan complete",
};

export type SimFault = {
  code: string;
  title: string;
  status: "stored" | "historical" | "pending";
  lastSeen: string;
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
  BECM: [
    {
      code: "P1A2E-71",
      title: "High-voltage battery, internal communication",
      status: "stored",
      lastSeen: "12 minutes ago",
      snapshot: true,
    },
  ],
  TCAM: [
    {
      code: "U110B-87",
      title: "Lost communication with telematics module",
      status: "historical",
      lastSeen: "3 drive cycles ago",
      snapshot: false,
    },
  ],
  CCM: [
    {
      code: "B1C15-13",
      title: "Cabin temperature sensor, circuit open",
      status: "pending",
      lastSeen: "this drive cycle",
      snapshot: true,
    },
  ],
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
