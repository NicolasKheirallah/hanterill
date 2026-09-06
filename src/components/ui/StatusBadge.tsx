import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "ok" | "warning" | "error" | "info" | "muted" | "accent";

const toneClass: Record<Tone, string> = {
  ok: "text-status-ok",
  warning: "text-status-warning",
  error: "text-status-error",
  info: "text-status-info",
  accent: "text-accent",
  muted: "text-text-muted",
};

const dotClass: Record<Tone, string> = {
  ok: "bg-status-ok",
  warning: "bg-status-warning",
  error: "bg-status-error",
  info: "bg-status-info",
  accent: "bg-accent",
  muted: "bg-text-muted",
};

/** A functional status marker: a dot plus a label, not a decorative pill. */
export function StatusMarker({
  tone,
  children,
  pulse = false,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] font-medium", toneClass[tone], className)}>
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", dotClass[tone], pulse && "animate-pulse-dot")}
      />
      {children}
    </span>
  );
}

/** A tag with genuine semantic purpose: version, platform, support status. */
export function Tag({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        tone === "muted" ? "text-text-secondary" : toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
