import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>{children}</div>;
}

/**
 * The page-body primitive. It owns the one section rhythm in the system -
 * `--space-2xl` on mobile, `--space-3xl` on desktop - inside a `Container`.
 *
 * Every page used to retype that padding on a raw `Container`, and two
 * different values had already grown: marketing pages used 7rem on desktop
 * while every feature, docs and content page used 4.5rem, so the same site
 * ran at two vertical densities 36% apart. Use this instead of
 * `<Container className="py-...">`.
 */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-2xl lg:py-3xl", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/**
 * Mono legend line. Used only where it labels a live instrument (channel,
 * units, source) - never as a decorative uppercase eyebrow above prose.
 * Ordinal numbering (`01 -`) is opt-in via `data-ordinal` and reserved for
 * genuinely sequential content (the session walkthrough).
 */
/**
 * Mono legend line. Used only where it labels a live instrument (channel,
 * units, source) - never as a decorative uppercase eyebrow above prose.
 * The `ordinal` variant was removed: it had no call sites, and the one piece
 * of genuinely sequential content (the 7-stage session walkthrough) numbers
 * itself. See design.md "What pages MUST share".
 */
export function Legend({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  as: As = "h2",
  title,
  lead,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[46rem]", className)}>
      <As className="text-[clamp(1.875rem,2.2vw+1rem,2.75rem)] leading-[1.1]">{title}</As>
      {lead ? (
        <p className="mt-5 max-w-[60ch] text-[length:var(--text-prose)] leading-relaxed text-text-secondary">
          {lead}
        </p>
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
    "group inline-flex items-center gap-1 text-[length:var(--text-body)] font-medium text-accent transition-colors hover:text-accent-hover";
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
