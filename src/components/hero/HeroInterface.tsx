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
import { DUR, EASE, SPRING } from "@/lib/motion";

/**
 * The hero mini-interface. The sidebar sections switch the view; the panel
 * itself is still, save for a sub-degree pointer parallax that is dropped
 * entirely under reduced motion. The view swap crossfades and collapses to a
 * plain cut when motion is not allowed.
 */
export function HeroInterface() {
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<PanelTabId>("overview");
  const frame = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [1.1, -1.1]), SPRING);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [-1.1, 1.1]), SPRING);

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const View = demoViewMap[tab];

  return (
    <figure className="m-0">
      <div
        ref={frame}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ perspective: 1200 }}
      >
        <motion.div style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}>
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
      </div>
      <figcaption className="mt-3 border-t border-line pt-2 font-mono text-[11px] text-text-muted">
        {tc("representative")}
      </figcaption>
    </figure>
  );
}
