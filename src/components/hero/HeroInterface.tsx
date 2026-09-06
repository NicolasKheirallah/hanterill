"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PanelChrome, type PanelTabId } from "@/components/product/PanelChrome";
import { demoViewMap } from "@/components/product/views";
import { DUR, EASE } from "@/lib/motion";

/**
 * The hero mini-interface. The sidebar sections switch the view; the panel
 * itself is still. The view swap crossfades, and collapses to a plain cut
 * under reduced motion.
 */
export function HeroInterface() {
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<PanelTabId>("overview");

  const View = demoViewMap[tab];

  return (
    <div>
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
      <p className="mt-3 text-center font-mono text-[11px] text-text-muted">
        {tc("representative")}
      </p>
    </div>
  );
}
