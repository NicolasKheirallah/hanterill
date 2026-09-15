"use client";
import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-motion-prefs";
import { DUR, EASE } from "@/lib/motion";

/**
 * Interpolates to a new value instead of snapping. Used sparingly: scan totals,
 * report figures. Not for values that change every frame.
 *
 * The rendered text is written from ONE source - the animation's own value.
 * It used to render `{value.toFixed()}` as children while the effect animated
 * from the previous motion value, so every update painted the target first
 * (12), then jumped back to wherever the spring was (7) and counted up again.
 * During a scan that happened every 100ms.
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
  const reduce = useReducedMotionSafe();
  const mv = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const settled = useRef(false);

  useEffect(() => {
    const write = (v: number) => {
      if (ref.current) ref.current.textContent = v.toFixed(decimals);
    };

    // First paint, and everything under reduced motion: land on the value.
    if (reduce || !settled.current) {
      settled.current = true;
      mv.set(value);
      write(value);
      return;
    }

    const controls = animate(mv, value, {
      duration: DUR.slow,
      ease: EASE.standard,
      onUpdate: write,
    });
    return () => controls.stop();
  }, [value, decimals, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
