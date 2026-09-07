import { cn } from "@/lib/cn";

/**
 * Hanterill wordmark. Set in the mono identifier face. The bronze brackets are
 * the site's one repeated identity motif - a diagnostic connector / signal
 * boundary. Callers set the size class.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-mono font-semibold tracking-tight text-text-primary",
        className,
      )}
    >
      <span aria-hidden className="text-accent">[</span>
      <span className="px-0.5">Hanterill</span>
      <span aria-hidden className="text-accent">]</span>
    </span>
  );
}
