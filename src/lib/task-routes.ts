/**
 * Task to screen routing for the docs "find the screen for your task" table.
 * Structure only: the labels live in the message catalog (`tasks.rows.*`) so
 * both locales render in their own language. The hygiene gate resolves every
 * href against the docs registry.
 */
export type TaskRoute = {
  /** Key under `tasks.rows` in the message catalog. */
  key: string;
  href: string;
};

export const taskRoutes: TaskRoute[] = [
  { key: "noVehicle", href: "/docs/connection" },
  { key: "usedBattery", href: "/docs/battery-diagnostics" },
  { key: "worthBuying", href: "/docs/inspection-reports" },
  { key: "activeFaults", href: "/docs/dtc-scanning" },
  { key: "repairCleared", href: "/docs/sessions-and-evidence" },
  { key: "dealerUpdate", href: "/docs/firmware-and-inventory" },
  { key: "flatBattery", href: "/docs/workspace-tour" },
  { key: "powerLoss", href: "/docs/live-telemetry" },
  { key: "intermittent", href: "/docs/live-telemetry" },
  { key: "modulesFitted", href: "/docs/ecu-reference" },
  { key: "didMeaning", href: "/docs/cli" },
  { key: "customerReport", href: "/docs/sessions-and-evidence" },
  { key: "scriptScan", href: "/docs/cli" },
  { key: "buildLimits", href: "/docs/safety" },
];
