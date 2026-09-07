import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

type Kind = "experimental" | "research";

const KIND: Record<Kind, { label: string; ring: string; text: string; note: string }> = {
  experimental: {
    label: "Experimental",
    ring: "border-status-info/40 bg-status-info/8",
    text: "text-status-info",
    note: "Implemented but not yet verified on a vehicle. Treat results as provisional.",
  },
  research: {
    label: "Research",
    ring: "border-line-strong bg-bg-secondary",
    text: "text-text-muted",
    note: "Under investigation. No verified implementation exists yet.",
  },
};

/**
 * Flags content that describes work ahead of verified support. `research` is
 * the earlier stage (being investigated), `experimental` means code exists but
 * has not been confirmed against a real car.
 */
export function Experimental({
  kind = "experimental",
  note,
  children,
}: {
  kind?: Kind;
  note?: string;
  children?: ReactNode;
}) {
  const { label, ring, text, note: fallback } = KIND[kind];
  return (
    <div className={cn("my-5 flex gap-3 rounded-md border px-4 py-3", ring)}>
      <FlaskConical className={cn("mt-0.5 h-4 w-4 shrink-0", text)} strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className={cn("font-mono text-[11px] uppercase tracking-[0.12em]", text)}>{label}</p>
        <div className="mt-1 text-[14px] leading-relaxed text-text-primary [&_a]:underline [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children ?? <p>{note ?? fallback}</p>}
        </div>
      </div>
    </div>
  );
}
