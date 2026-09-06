import { ecus, type Ecu } from "@/lib/ecus";

const DOMAIN_LABEL: Record<Ecu["domain"], string> = {
  gateway: "Gateway",
  energy: "Energy",
  chassis: "Chassis",
  cabin: "Cabin",
};

/**
 * Renders the CMA ECU table straight from src/lib/ecus.ts so the docs and the
 * site's ECU topology never drift apart. Filter by `domain`, or pass an
 * explicit `codes` list for a focused reference.
 */
export function EcuReference({
  domain,
  codes,
  caption,
}: {
  domain?: Ecu["domain"];
  codes?: string[];
  caption?: string;
}) {
  const want = codes?.map((c) => c.toUpperCase());
  const rows = ecus.filter((e) => {
    if (want) return want.includes(e.code);
    if (domain) return e.domain === domain;
    return true;
  });

  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line-strong text-left">
              <th className="px-3 py-2 font-medium text-text-primary">Code</th>
              <th className="px-3 py-2 font-medium text-text-primary">Name</th>
              <th className="px-3 py-2 font-medium text-text-primary">Part number</th>
              <th className="px-3 py-2 font-medium text-text-primary">Domain</th>
              <th className="px-3 py-2 font-medium text-text-primary">UDS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.code} className="border-b border-line last:border-0">
                <td className="px-3 py-2 font-mono text-text-primary">{e.code}</td>
                <td className="px-3 py-2 text-text-secondary">{e.name}</td>
                <td className="px-3 py-2 font-mono text-text-muted">{e.partNumber ?? "not listed"}</td>
                <td className="px-3 py-2 text-text-secondary">{DOMAIN_LABEL[e.domain]}</td>
                <td className="px-3 py-2 text-text-secondary">{e.diagnostic ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="mt-2 text-[12px] text-text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
