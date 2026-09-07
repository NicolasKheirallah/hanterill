import type { ReactNode } from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutKind = "note" | "caution" | "warning";

const KIND: Record<CalloutKind, { icon: typeof Info; label: string; className: string }> = {
  note: { icon: Info, label: "Note", className: "border-line-strong bg-bg-secondary text-text-secondary" },
  caution: {
    icon: AlertTriangle,
    label: "Caution",
    className: "border-status-warning/40 bg-status-warning/8 text-text-primary",
  },
  warning: {
    icon: ShieldAlert,
    label: "Warning",
    className: "border-status-error/40 bg-status-error/8 text-text-primary",
  },
};

/**
 * Callout for docs. `warning` and `caution` carry the visual weight the safety
 * brief asks for: a service routine or an unverified platform must not read as
 * an ordinary paragraph.
 */
export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, label, className } = KIND[kind];
  return (
    <div className={cn("my-5 flex gap-3 rounded-md border px-4 py-3 text-[14px] leading-relaxed", className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
          {title ?? label}
        </p>
        <div className="mt-1 [&_a]:underline [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Key/value reference data (identifiers, part numbers). A real definition list,
 * with the identifier in monospace, rather than a fenced text block.
 */
export function SpecList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="my-5 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-[minmax(8rem,max-content)_1fr]">
      {rows.map(([term, def]) => (
        <div key={term} className="contents">
          <dt className="bg-surface px-3 py-2 font-mono text-[13px] text-text-primary">{term}</dt>
          <dd className="bg-surface px-3 py-2 text-[13px] text-text-secondary">{def}</dd>
        </div>
      ))}
    </dl>
  );
}
