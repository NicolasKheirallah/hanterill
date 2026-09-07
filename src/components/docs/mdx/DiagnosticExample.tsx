/**
 * A single request/response exchange, flat and monospace. Deliberately not a
 * rounded terminal card: a hairline border, a thin service header, two rows.
 * Use it to show what a UDS service actually looks like on the wire.
 */
export function DiagnosticExample({
  service,
  request,
  response,
  note,
}: {
  service?: string;
  request: string;
  response: string;
  note?: string;
}) {
  return (
    <div className="my-5 overflow-hidden rounded-md border border-line">
      {service ? (
        <div className="border-b border-line bg-bg-secondary px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {service}
          </span>
        </div>
      ) : null}
      <dl className="divide-y divide-line font-mono text-[13px]">
        <div className="flex gap-3 px-3 py-2">
          <dt className="w-20 shrink-0 text-text-muted">request</dt>
          <dd className="min-w-0 break-all text-text-primary">{request}</dd>
        </div>
        <div className="flex gap-3 px-3 py-2">
          <dt className="w-20 shrink-0 text-text-muted">response</dt>
          <dd className="min-w-0 break-all text-text-primary">{response}</dd>
        </div>
      </dl>
      {note ? (
        <p className="border-t border-line px-3 py-2 text-[12px] leading-relaxed text-text-secondary">
          {note}
        </p>
      ) : null}
    </div>
  );
}
