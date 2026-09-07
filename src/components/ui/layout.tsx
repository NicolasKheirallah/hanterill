import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-2xl lg:py-3xl", bleed && "overflow-hidden", className)}
    >
      {children}
    </section>
  );
}

/**
 * Mono legend line. Used only where it labels a live instrument (channel,
 * units, source) - never as a decorative uppercase eyebrow above prose.
 * Ordinal numbering (`01 -`) is opt-in via `data-ordinal` and reserved for
 * genuinely sequential content (the session walkthrough).
 */
export function Eyebrow({
  children,
  className,
  ordinal = false,
}: {
  children: ReactNode;
  className?: string;
  ordinal?: boolean;
}) {
  return (
    <p
      {...(ordinal ? { "data-ordinal": "" } : {})}
      className={cn(
        ordinal
          ? "font-mono text-[12px] tracking-[0.08em] text-text-muted"
          : "font-mono text-[11.5px] uppercase tracking-[0.12em] text-text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  as: As = "h2",
  eyebrow,
  title,
  lead,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[46rem]", className)}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <As className="text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[2.9rem]">
        {title}
      </As>
      {lead ? (
        <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-relaxed text-text-secondary">{lead}</p>
      ) : null}
    </div>
  );
}

export function MoreLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center gap-1 text-[15px] font-medium text-accent transition-colors hover:text-accent-hover";
  const inner = (
    <>
      <span className="rule-link">{children}</span>
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.75}
      />
    </>
  );
  if (external || /^https?:\/\//.test(href)) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** Ruler-edge divider between instrument-panel sections. */
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("rule-ticks", className)} />;
}

/**
 * A bezel-framed instrument figure with a mono channel legend. The Workbench
 * shape: the live component is the content, the legend says what you read from
 * it and carries the sample-data disclaimer.
 */
export function Figure({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("bezel bg-surface", className)}>
      <div className="p-4 sm:p-6">{children}</div>
      {caption ? (
        <figcaption className="border-t border-line px-4 py-3 font-mono text-[12px] leading-relaxed text-text-muted sm:px-6">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
