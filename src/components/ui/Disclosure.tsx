"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Progressive disclosure for engineering detail. Collapsed by default so the
 * normal view stays uncluttered; the label says exactly what opens.
 */
export function Disclosure({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();

  return (
    <div className={cn("border-t border-line pt-3", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 font-mono text-[12px] text-text-secondary transition-colors hover:text-text-primary"
      >
        <Plus
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-45")}
          strokeWidth={1.75}
        />
        {label}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE.standard }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
