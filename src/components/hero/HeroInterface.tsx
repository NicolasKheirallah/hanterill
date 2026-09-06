"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { PanelChrome, type PanelTabId } from "@/components/product/PanelChrome";
import { demoViewMap } from "@/components/product/views";
import { DUR, EASE } from "@/lib/motion";

/**
 * The hero mini-interface. Sidebar sections switch the view; the pointer nudges
 * the panel by up to 1.5 degrees. Both effects are off under reduced motion and
 * for touch input.
 */
export function HeroInterface() {
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<PanelTabId>("overview");
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [1.5, -1.5]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-1.5, 1.5]), { stiffness: 150, damping: 20 });

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || e.pointerType === "touch") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  const View = demoViewMap[tab];

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.out, delay: 0.34 }}
      >
        <PanelChrome active={tab} onSelect={setTab}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: DUR.base, ease: EASE.standard }}
            >
              <View />
            </motion.div>
          </AnimatePresence>
        </PanelChrome>
      </motion.div>
      <p className="mt-3 text-center font-mono text-[11px] text-text-muted">
        {tc("representative")}
      </p>
    </div>
  );
}
