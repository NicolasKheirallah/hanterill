import type { ReactNode } from "react";

/**
 * Marks a doc, section or platform as actively being built. Block form for a
 * section header, `inline` form for a single sentence. Restrained on purpose:
 * a hairline strip, no construction-tape treatment.
 */
export function Wip({
  children,
  note,
  inline = false,
}: {
  children?: ReactNode;
  note?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <span className="mx-0.5 inline-flex items-center rounded-xs border border-status-info/40 bg-status-info/8 px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.12em] text-status-info">
        WIP
      </span>
    );
  }
  return (
    <div className="my-5 rounded-md border border-status-info/40 bg-status-info/8 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-status-info">Work in progress</p>
      <div className="mt-1 text-[14px] leading-relaxed text-text-primary [&_a]:underline [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
        {children ?? <p>{note ?? "This area is being built and verified. Details may still change."}</p>}
      </div>
    </div>
  );
}
