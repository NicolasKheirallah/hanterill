import { demoVehicle, evidenceDemo, batteryDemo } from "@/lib/demo-data";
import { scanTotals } from "@/lib/scan-sim";

/** Fixed data for the 7-stage representative session. Not a vehicle reading. */

export const sessionStages = [
  { id: "connect", n: "01" },
  { id: "identify", n: "02" },
  { id: "scan", n: "03" },
  { id: "inspect", n: "04" },
  { id: "battery", n: "05" },
  { id: "live", n: "06" },
  { id: "report", n: "07" },
] as const;

export type SessionStageId = (typeof sessionStages)[number]["id"];

export const identify = {
  model: demoVehicle.model,
  platform: "CMA",
  powertrain: "Dual motor",
  modelYear: demoVehicle.modelYear,
  vin: "••••••••••••1234",
};

export const inspectFault = {
  code: "P1A2E-71",
  ecu: "BECM",
  title: "High-voltage battery, internal communication",
  status: "Stored" as const,
  snapshot: "Available",
  timestamp: "12 minutes ago",
  detail:
    "Recorded once on module string 3, not currently active. A snapshot of pack voltage, current and temperature was captured when it set.",
};

export const report = {
  ecusDiscovered: scanTotals.discovered,
  modulesWithFaults: evidenceDemo.before.active + evidenceDemo.before.pending,
  activeFaults: 0,
  storedFaults: 4,
  batteryHealth: batteryDemo.soh,
  cellDelta: batteryDemo.cellDelta,
};

/** A small, clearly-labelled example export. */
export function reportRows() {
  return [
    ["metric", "value"],
    ["ecus_discovered", String(report.ecusDiscovered)],
    ["modules_with_faults", String(report.modulesWithFaults)],
    ["active_faults", String(report.activeFaults)],
    ["stored_faults", String(report.storedFaults)],
    ["battery_health_percent", report.batteryHealth.toFixed(2)],
    ["cell_delta_mv", String(report.cellDelta)],
  ];
}

export function reportCsv() {
  return reportRows()
    .map((r) => r.join(","))
    .join("\n");
}

export function reportJson() {
  return JSON.stringify(
    {
      note: "Example report from the openCMA website. Representative sample data, not a vehicle reading.",
      vehicle: { model: identify.model, platform: identify.platform, vin: identify.vin },
      summary: report,
      generatedAt: null,
    },
    null,
    2,
  );
}
