import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Enter-on-scroll for a block of content. Implemented as a native CSS
 * scroll-driven animation (`animation-timeline: view()` in globals.css): it
 * runs on the compositor with no JavaScript and no scroll observer. The base
 * style keeps opacity at 1, so content is readable when the animation does not
 * run: no `animation-timeline` support, or reduced motion. A stack of these
 * cascades on its own as each element crosses its entry range.
 */
export function Reveal({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  return <As className={cn("reveal", className)}>{children}</As>;
}
