"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { batteryDemo } from "@/lib/demo-data";
import { DUR, EASE } from "@/lib/motion";
import { Provenance, SohGauge } from "./SohGauge";

type Level = "simple" | "detailed" | "engineering";

/**
 * Battery Health, shown at three levels of detail. The state-of-health figure
 * is a dial that sweeps in on first view; clicking it opens where the value
 * comes from. Raw data identifiers are not in the UI - the Engineering level
 * and the provenance popover link to the identifier reference in the docs.
 */
const LEVEL_KEY: Record<Level, "levelSimple" | "levelDetailed" | "levelEngineering"> = {
  simple: "levelSimple",
  detailed: "levelDetailed",
  engineering: "levelEngineering",
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function BatteryHealthPanel() {
  const t = useTranslations("battery");
  const tc = useTranslations("common");
  const [level, setLevel] = useState<Level>("simple");
  const reduce = useReducedMotion();

  return (
    <div className="bezel bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          {t("stateOfHealth")}
        </span>
        <ToggleGroup.Root
          type="single"
          value={level}
          onValueChange={(v) => v && setLevel(v as Level)}
          aria-label={t("detailLevelAria")}
          className="inline-flex rounded-sm border border-line-strong bg-bg-secondary p-0.5 font-mono text-[11px]"
        >
          {(["simple", "detailed", "engineering"] as Level[]).map((l) => (
            <ToggleGroup.Item
              key={l}
              value={l}
              className="rounded-[2px] px-2 py-1 press text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
            >
              {t(LEVEL_KEY[l])}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-5">
          <SohGauge value={batteryDemo.soh} />
          <dl className="min-w-0 flex-1 font-mono text-[12px]">
            <Field label={t("source")} value={t("vehicleBms")} />
            <Field label={t("updated")} value={t("live")} />
            <Field label={t("condition")} value={t("conditionGood")} />
          </dl>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={level}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: DUR.base, ease: EASE.standard }}
          >
            {level === "detailed" ? (
              <div className="mt-4 border-t border-line pt-3">
                <dl className="grid grid-cols-2 gap-x-8 font-mono text-[12px]">
                  <Field label={t("stateOfCharge")} value={`${batteryDemo.soc} %`} />
                  <Field label={t("cellDelta")} value={`${batteryDemo.cellDelta} mV`} />
                  <Field label={t("packVoltage")} value={`${batteryDemo.packVoltage.toFixed(1)} V`} />
                  <Field label={t("stateOfHealth")} value={`${batteryDemo.soh.toFixed(1)} %`} />
                </dl>
                <CapacityBar
                  label={t("usableCapacity")}
                  est={batteryDemo.capacityEstimated}
                  nominal={batteryDemo.capacityNominal}
                />
                <TempStrip
                  label={t("packTemp")}
                  min={batteryDemo.tempMin}
                  max={batteryDemo.tempMax}
                />
              </div>
            ) : null}

            {level === "engineering" ? (
              <div className="mt-4 border-t border-line pt-3">
                <div className="mb-2 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                  {t("howRead")}
                </div>
                <Provenance t={t} />
                <Link
                  href="/docs/battery-diagnostics"
                  className="mt-3 inline-block font-mono text-[11px] text-accent transition-colors hover:text-accent-hover"
                >
                  {t("didReference")}
                </Link>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 border-t border-line pt-3 font-mono text-[10.5px] leading-relaxed text-text-muted">
          {tc("representative")}
        </p>
      </div>
    </div>
  );
}

function CapacityBar({ label, est, nominal }: { label: string; est: number; nominal: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const frac = clamp01(est / nominal);
  return (
    <div ref={ref} className="mt-4 border-t border-line pt-3 font-mono text-[12px]">
      <div className="flex items-baseline justify-between">
        <span className="text-text-secondary">{label}</span>
        <span className="tnum text-text-primary">
          {est} / {nominal} kWh
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-[1px] bg-line">
        <motion.div
          className="h-full bg-accent"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: reduce || inView ? frac : 0 }}
          transition={{ duration: 0.7, ease: EASE.out }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

function TempStrip({ label, min, max }: { label: string; min: number; max: number }) {
  // Fixed reference window for the sample data; the band shows where the pack sits.
  const LO = 15;
  const HI = 35;
  const l = clamp01((min - LO) / (HI - LO)) * 100;
  const r = clamp01((max - LO) / (HI - LO)) * 100;
  return (
    <div className="mt-4 border-t border-line pt-3 font-mono text-[12px]">
      <div className="flex items-baseline justify-between">
        <span className="text-text-secondary">{label}</span>
        <span className="tnum text-text-primary">
          {min.toFixed(1)} to {max.toFixed(1)} °C
        </span>
      </div>
      <div className="relative mt-2 h-1.5 w-full rounded-[1px] bg-line">
        <span
          className="absolute inset-y-0 rounded-[1px] bg-accent"
          style={{ left: `${l}%`, right: `${100 - r}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-text-muted">
        <span>{LO} °C</span>
        <span>{HI} °C</span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="tnum text-text-primary">{value}</dd>
    </div>
  );
}
