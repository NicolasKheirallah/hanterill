"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DUR, EASE } from "@/lib/motion";
import {
  SCAN_END,
  scanTotals,
  simEcus,
  stageAt,
  stageKey,
  type ScanStage,
  type SimFault,
} from "@/lib/scan-sim";
import { cn } from "@/lib/cn";

const statusClass: Record<SimFault["status"], string> = {
  stored: "text-status-info",
  historical: "text-text-muted",
  pending: "text-status-warning",
};

const statusKey: Record<SimFault["status"], "statusStored" | "statusHistorical" | "statusPending"> = {
  stored: "statusStored",
  historical: "statusHistorical",
  pending: "statusPending",
};

export function ScanSimulator({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("scan");
  const td = useTranslations("demo");
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.4 });

  const [elapsed, setElapsed] = useState(reduce ? SCAN_END : 0);
  const [openEcu, setOpenEcu] = useState<string | null>(null);
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  const stage: ScanStage = stageAt(elapsed);
  const done = stage === "complete";
  // The scan runs itself once the section is on screen. No start control -
  // scrolling away freezes the clock, scrolling back resumes it.
  const running = inView && !reduce && !done;

  useEffect(() => {
    if (!running) return;
    const tick = (now: number) => {
      if (!last.current) last.current = now;
      // Cap the per-frame step so a backgrounded tab does not fast-forward the
      // whole scan on return.
      const dt = Math.min(now - last.current, 100);
      last.current = now;
      setElapsed((e) => Math.min(SCAN_END, e + dt));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = 0;
    };
  }, [running]);

  const visibleEcus = simEcus.filter((e) => elapsed >= e.at);
  const faultCount = visibleEcus.reduce((n, e) => n + e.faults.length, 0);

  function replay() {
    last.current = 0;
    setElapsed(0);
    setOpenEcu(null);
  }

  return (
    <div ref={rootRef} className="bezel bg-surface">
      {/* Header: stage + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <StatusMarker tone={done ? "ok" : stage === "idle" ? "muted" : "info"} pulse={!done && stage !== "idle"}>
            <span aria-live="polite">{t(stageKey[stage])}</span>
          </StatusMarker>
        </div>
        {done ? (
          <button
            type="button"
            aria-label={t("replayScanAria")}
            onClick={replay}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line px-2.5 font-mono text-[12px] text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} /> {t("replay")}
          </button>
        ) : null}
      </div>

      {/* Vehicle line */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[12px]">
        <span className="text-text-muted">{t("vehicle")}</span>
        <span className={cn("transition-colors", elapsed >= 900 ? "text-text-primary" : "text-text-muted")}>
          {elapsed >= 900 ? t("vehicleId") : t("detecting")}
        </span>
      </div>

      {/* Totals row: layout-stable */}
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line font-mono text-[12px]">
        <Stat label={t("ecus")} value={done ? scanTotals.discovered : visibleEcus.length} suffix={done ? "" : ` / ${simEcus.length}`} />
        <Stat
          label={t("faults")}
          value={faultCount}
          placeholder={stage === "scanning" ? t("scanning") : undefined}
        />
        <Stat label={t("withFaults")} value={new Set(visibleEcus.filter((e) => e.faults.length).map((e) => e.code)).size} />
      </div>

      {/* ECU list */}
      <ul className={cn("divide-y divide-line", compact ? "max-h-[15rem] overflow-y-auto" : "")}>
        <AnimatePresence initial={false}>
          {visibleEcus.map((e) => {
            const isOpen = openEcu === e.code;
            return (
              <motion.li
                key={e.code}
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.fast, ease: EASE.out }}
              >
                <button
                  type="button"
                  aria-expanded={e.faults.length ? isOpen : undefined}
                  onClick={() => e.faults.length && setOpenEcu(isOpen ? null : e.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left",
                    e.faults.length ? "hover:bg-bg-secondary" : "cursor-default",
                  )}
                >
                  <span className="font-mono text-[13px] text-text-primary">{e.code}</span>
                  {e.faults.length ? (
                    <span className="font-mono text-[12px] text-status-warning">
                      {t("faultLine", {
                        count: e.faults.length,
                        status: t(statusKey[e.faults[0].status]),
                      })}
                    </span>
                  ) : (
                    <StatusMarker tone="ok">{t("ready")}</StatusMarker>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && e.faults.length ? (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: DUR.base, ease: EASE.standard }}
                      className="overflow-hidden"
                    >
                      {e.faults.map((f) => (
                        <div key={f.code} className="border-t border-line bg-bg-secondary/50 px-4 py-3">
                          <div className="flex items-center justify-between font-mono text-[12px]">
                            <span className="text-text-primary">{f.code}</span>
                            <span className={cn("text-[11px] uppercase tracking-wider", statusClass[f.status])}>
                              {t(statusKey[f.status])}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] text-text-secondary">
                            {td(`faultTitles.${f.code}`)}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-text-muted">
                            {t("lastObserved")} {td(f.lastSeenKey)}
                            {f.snapshot ? ` · ${t("snapshotAvailable")}` : ""}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <p className="border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {t("footerNote")}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  placeholder,
}: {
  label: string;
  value: number;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="uppercase tracking-wider text-text-muted">{label}</div>
      <div className="tnum mt-1 text-text-primary">
        {placeholder ? (
          <span className="text-text-secondary">{placeholder}</span>
        ) : (
          <>
            <AnimatedNumber value={value} />
            {suffix}
          </>
        )}
      </div>
    </div>
  );
}
