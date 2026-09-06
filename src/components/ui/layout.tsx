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
      className={cn("scroll-mt-20 py-20 sm:py-28 lg:py-32", bleed && "overflow-hidden", className)}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted",
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
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <As className="text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
        {title}
      </As>
      {lead ? <p className="mt-5 text-lg leading-relaxed text-text-secondary">{lead}</p> : null}
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
    "group inline-flex items-center gap-1.5 text-[15px] font-medium text-accent transition-colors hover:text-accent-hover";
  const inner = (
    <>
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
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

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
