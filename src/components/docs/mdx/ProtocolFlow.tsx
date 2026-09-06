type Step = string | { node: string; detail?: string };

/**
 * A diagnostic path shown as an ordered list of hops (openCMA, Ethernet,
 * gateway, target ECU) with an optional request line above and response line
 * below. Static and keyboard-neutral: it explains routing in the docs, it does
 * not animate. The connector is a hairline, not a glyph.
 */
export function ProtocolFlow({
  steps,
  request,
  response,
}: {
  steps: Step[];
  request?: string;
  response?: string;
}) {
  const norm = steps.map((s) => (typeof s === "string" ? { node: s } : s));

  return (
    <div className="my-5 rounded-md border border-line bg-surface px-4 py-4">
      {request ? (
        <p className="mb-3 font-mono text-[12px] text-text-muted">
          <span className="mr-2 uppercase tracking-[0.12em] text-text-primary">request</span>
          {request}
        </p>
      ) : null}
      <ol className="relative ml-1 border-l border-line-strong">
        {norm.map((s, i) => (
          <li key={`${s.node}-${i}`} className="relative py-1.5 pl-5">
            <span
              className="absolute left-0 top-[0.9rem] h-1.5 w-1.5 -translate-x-[3.5px] rounded-full bg-text-muted"
              aria-hidden
            />
            <span className="font-mono text-[13px] text-text-primary">{s.node}</span>
            {s.detail ? <span className="ml-2 text-[12px] text-text-muted">{s.detail}</span> : null}
          </li>
        ))}
      </ol>
      {response ? (
        <p className="mt-3 font-mono text-[12px] text-text-muted">
          <span className="mr-2 uppercase tracking-[0.12em] text-text-primary">response</span>
          {response}
        </p>
      ) : null}
    </div>
  );
}
