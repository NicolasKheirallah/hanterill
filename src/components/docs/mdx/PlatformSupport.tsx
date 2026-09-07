import { vehicles, platformMeta, statusMeta, type Platform } from "@/lib/vehicles";
import { cn } from "@/lib/cn";
import { toneText } from "./tone";

// English labels for docs (English-only for now); the marketing site reads
// these from the message catalog. When docs gain Swedish this should move there.
const STATUS_LABEL: Record<string, string> = {
  supported: "Supported",
  partial: "Partial",
  testing: "Testing",
  wip: "WIP",
  research: "Research",
  planned: "Planned",
};

const BLURB: Record<Platform, string> = {
  CMA: "Compact Modular Architecture. The tested platform: Polestar 2 and the CMA Volvos share one high-voltage layout.",
  SPA: "Scalable Product Architecture. Plug-in hybrids. Hanterill reaches these cars over DoIP; ECU mapping and battery decoding are in progress.",
  SEA: "Sustainable Experience Architecture. Battery and ECU layout differ from CMA and are not yet verified.",
  SPA2: "Second-generation SPA. Reachable over DoIP; gateway and security model are still under study.",
};

/**
 * Every vehicle on one platform, with the platform's own verified-support
 * status and each model's status shown side by side. Data comes from
 * src/lib/vehicles.ts; platform compatibility is never presented as support.
 */
export function PlatformSupport({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  const list = vehicles.filter((v) => v.platform === platform);

  return (
    <div className="my-5 overflow-hidden rounded-md border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-secondary px-4 py-3">
        <p className="font-mono text-[13px] text-text-primary">{meta.label}</p>
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.12em]",
            toneText[statusMeta[meta.status].tone],
          )}
        >
          {STATUS_LABEL[meta.status] ?? meta.status}
        </p>
      </div>

      <p className="px-4 py-3 text-[13px] leading-relaxed text-text-secondary">{BLURB[platform]}</p>

      {list.length ? (
        <table className="w-full border-collapse border-t border-line text-[13px]">
          <tbody>
            {list.map((v) => (
              <tr key={v.model} className="border-b border-line last:border-0">
                <td className="px-4 py-2 text-text-primary">{v.model}</td>
                <td className="px-4 py-2 text-text-muted">{v.powertrain}</td>
                <td
                  className={cn(
                    "px-4 py-2 text-right font-mono text-[12px]",
                    toneText[statusMeta[v.status].tone],
                  )}
                >
                  {STATUS_LABEL[v.status] ?? v.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
