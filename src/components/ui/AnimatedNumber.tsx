"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { DUR, EASE } from "@/lib/motion";

/**
 * Interpolates to a new value instead of snapping. Used sparingly: scan totals,
 * report figures. Not for values that change every frame.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = value.toFixed(decimals);
      return;
    }
    const controls = animate(mv, value, {
      duration: DUR.slow,
      ease: EASE.standard,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [value, decimals, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
