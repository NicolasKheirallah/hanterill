"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Enter-on-scroll for a block of content. Opacity is left at 1 so the
 * content is always readable; only a small rise animates. Under
 * reduced-motion nothing moves.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={cn(className)}
      initial={reduce ? false : { y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </MotionTag>
  );
}
