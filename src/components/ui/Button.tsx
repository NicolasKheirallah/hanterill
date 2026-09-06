import { Link } from "@/i18n/navigation";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:translate-y-px active:scale-[0.99] motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-text-primary text-bg-primary hover:opacity-90 border border-transparent",
  secondary: "bg-transparent text-text-primary border border-line-strong hover:border-text-primary hover:bg-bg-secondary",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-transparent",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[15px]",
  sm: "h-9 px-3 text-[13px]",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
}: StyleProps & { href: string; external?: boolean }) {
  const cls = cn(base, variants[variant], sizes[size], className);
  const isExternal = external ?? /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function ButtonEl({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: StyleProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}
