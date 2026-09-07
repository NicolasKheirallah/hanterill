/**
 * Data-identifier reference. A real definition list with the DID in monospace,
 * not a fenced text block. Pass `ids` to pick from the common set, or `rows`
 * to supply your own [identifier, meaning] pairs.
 */
const COMMON: Record<string, string> = {
  "0xF190": "VIN",
  "0xF18C": "ECU serial number",
  "0xF191": "Vehicle hardware number",
  "0xF193": "Supplier hardware version",
  "0xF194": "Supplier software number",
  "0xF195": "Supplier software version",
  "0xF1A0": "Diagnostic specification version",
  "0x496D": "Battery state of health, BECM vendor identifier",
};

export function DidReference({
  ids,
  rows,
  title = "Data identifiers",
}: {
  ids?: string[];
  rows?: [string, string][];
  title?: string;
}) {
  const data: [string, string][] =
    rows ?? (ids ? ids.map((id) => [id, COMMON[id] ?? "vendor-specific"]) : Object.entries(COMMON));

  return (
    <div className="my-5">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        {title}, read with ReadDataByIdentifier
      </p>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-[minmax(7rem,max-content)_1fr]">
        {data.map(([id, name]) => (
          <div key={id} className="contents">
            <dt className="bg-surface px-3 py-2 font-mono text-[13px] text-text-primary">{id}</dt>
            <dd className="bg-surface px-3 py-2 text-[13px] text-text-secondary">{name}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
