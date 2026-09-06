import { vehicles, capStatusMeta, type Capability, type CapStatus } from "@/lib/vehicles";
import { cn } from "@/lib/cn";
import { toneText } from "./tone";

const CAP_LABEL: Record<Capability, string> = {
  connection: "Connection",
  "ecu-discovery": "ECU discovery",
  "dtc-scan": "DTC scan",
  "battery-soh": "Battery SoH",
  "cell-potentials": "Cell potentials",
  "live-data": "Live data",
  "service-routines": "Service routines",
};

const CAP_STATUS_LABEL: Record<CapStatus, string> = {
  supported: "Supported",
  partial: "Partial",
  "in-progress": "In progress",
  "not-verified": "Not verified",
  none: "Not started",
};

// English labels for docs, which are English-only for now. The marketing site
// reads these from the message catalog; when docs gain Swedish this should move
// there too. See AUDIT.md, doc i18n gap.
const STATUS_LABEL: Record<string, string> = {
  supported: "Supported",
  partial: "Partial",
  testing: "Testing",
  wip: "Work in progress",
  research: "Research",
  planned: "Planned",
};

const CAP_ORDER: Capability[] = [
  "connection",
  "ecu-discovery",
  "dtc-scan",
  "battery-soh",
  "cell-potentials",
  "live-data",
  "service-routines",
];

/**
 * One vehicle's verified-support record, straight from src/lib/vehicles.ts.
 * Platform membership and verified support are shown as separate facts, and no
 * completion percentage is invented.
 */
export function VehicleSupport({ model }: { model: string }) {
  const v = vehicles.find(
    (x) => x.model === model || x.model.toLowerCase().startsWith(model.toLowerCase()),
  );

  if (!v) {
    return (
      <p className="my-5 rounded-md border border-status-warning/40 bg-status-warning/8 px-3 py-2 text-[13px] text-text-primary">
        No support record for &quot;{model}&quot;.
      </p>
    );
  }

  return (
    <div className="my-5 overflow-hidden rounded-md border border-line">
      <div className="border-b border-line bg-bg-secondary px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
          {v.manufacturer}
        </p>
        <p className="mt-0.5 text-[15px] font-medium text-text-primary">{v.model}</p>
      </div>

      <dl className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
        {[
          ["Platform", v.platform],
          ["Powertrain", v.powertrain],
          ["Verified support", STATUS_LABEL[v.status] ?? v.status],
          ["Model years", v.years],
        ].map(([k, val]) => (
          <div key={k} className="bg-surface px-4 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.1em] text-text-muted">{k}</dt>
            <dd className="mt-0.5 text-[13px] text-text-primary">{val}</dd>
          </div>
        ))}
      </dl>

      <table className="w-full border-collapse border-t border-line text-[13px]">
        <tbody>
          {CAP_ORDER.filter((c) => v.capabilities[c]).map((c) => {
            const st = v.capabilities[c] as CapStatus;
            return (
              <tr key={c} className="border-b border-line last:border-0">
                <td className="px-4 py-2 text-text-secondary">{CAP_LABEL[c]}</td>
                <td
                  className={cn(
                    "px-4 py-2 text-right font-mono text-[12px]",
                    toneText[capStatusMeta[st].tone],
                  )}
                >
                  {CAP_STATUS_LABEL[st]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {v.research?.length ? (
        <div className="border-t border-line bg-bg-secondary px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-text-muted">Current research</p>
          <ul className="mt-1 list-disc pl-4 text-[13px] text-text-secondary [&_li]:my-0.5">
            {v.research.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
