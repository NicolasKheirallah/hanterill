"use client";

import { Link } from "@/i18n/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { glossary } from "@/lib/glossary";
import { cn } from "@/lib/cn";

/**
 * A technical acronym that reveals its expansion on hover or focus. If a doc
 * exists it becomes a link into the reference.
 */
export function InfoLabel({ term, className }: { term: string; className?: string }) {
  const entry = glossary[term];
  if (!entry) return <span className={className}>{term}</span>;

  const trigger = (
    <span
      className={cn(
        "underline decoration-line-strong decoration-dotted underline-offset-2 outline-none focus-visible:decoration-accent",
        className,
      )}
    >
      {term}
    </span>
  );

  return (
    <Tooltip.Provider delayDuration={120}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {entry.doc ? (
            <Link href={entry.doc} className="rounded-[1px]">
              {trigger}
            </Link>
          ) : (
            <button type="button" className="rounded-[1px]">
              {trigger}
            </button>
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-50 max-w-[16rem] rounded-sm border border-line-strong bg-surface px-2.5 py-1.5 text-[12px] leading-snug text-text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            <span className="font-mono text-text-primary">{term}</span>{" "}
            <span>{entry.full}</span>
            <Tooltip.Arrow className="fill-[var(--line-strong)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
