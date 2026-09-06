import type { ReactNode } from "react";
import { ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { toneRing, toneText, type Tone } from "./tone";

type Level = "read-only" | "adaptation" | "high-voltage";

const LEVEL: Record<Level, { tone: Tone; label: string; icon: typeof ShieldAlert }> = {
  "read-only": { tone: "ok", label: "Read-only operation", icon: ShieldCheck },
  adaptation: { tone: "warning", label: "Writes to the vehicle", icon: ShieldAlert },
  "high-voltage": { tone: "error", label: "High-voltage safety", icon: Zap },
};

/**
 * Safety callout for docs. Distinct from the general Callout: it always names
 * the operation class, so a routine that actuates hardware or touches the HV
 * system can never read as an ordinary paragraph.
 */
export function SafetyNotice({
  level = "adaptation",
  title,
  children,
}: {
  level?: Level;
  title?: string;
  children: ReactNode;
}) {
  const { tone, label, icon: Icon } = LEVEL[level];
  return (
    <div
      role="note"
      className={cn(
        "my-5 flex gap-3 rounded-md border px-4 py-3 text-[14px] leading-relaxed text-text-primary",
        toneRing[tone],
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneText[tone])} strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", toneText[tone])}>
          {title ?? label}
        </p>
        <div className="mt-1 [&_a]:underline [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
