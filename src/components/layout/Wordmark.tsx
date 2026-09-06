import { cn } from "@/lib/cn";

/**
 * openCMA wordmark. The bracket glyph reads as a diagnostic connector /
 * signal boundary and is the site's one repeated identity motif.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-mono text-[15px] font-semibold tracking-tight", className)}>
      <span aria-hidden className="text-accent">[</span>
      <span className="px-0.5">
        open<span className="text-text-primary">CMA</span>
      </span>
      <span aria-hidden className="text-accent">]</span>
    </span>
  );
}
