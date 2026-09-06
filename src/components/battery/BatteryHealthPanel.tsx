"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { batteryDemo } from "@/lib/demo-data";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Level = "simple" | "detailed" | "engineering";

/**
 * Battery Health, shown at three levels of detail. Raw data identifiers are not
 * in the UI at all; the Engineering level explains where the value comes from
 * and links to the identifier reference in the docs.
 */
const LEVEL_KEY: Record<Level, "levelSimple" | "levelDetailed" | "levelEngineering"> = {
  simple: "levelSimple",
  detailed: "levelDetailed",
  engineering: "levelEngineering",
};

export function BatteryHealthPanel() {
  const t = useTranslations("battery");
  const [level, setLevel] = useState<Level>("simple");
  const reduce = useReducedMotion();

  return (
    <div className="rounded-lg border border-line bg-surface">
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
              className="rounded-[2px] px-2 py-1 text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
            >
              {t(LEVEL_KEY[l])}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <div className="p-5">
        <div className="tnum font-mono text-[3rem] leading-none text-text-primary">
          {batteryDemo.soh.toFixed(1)}
          <span className="ml-1 align-top text-xl text-text-secondary">%</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-8 border-t border-line pt-3 font-mono text-[12px]">
          <Field label={t("source")} value={t("vehicleBms")} />
          <Field label={t("updated")} value={t("live")} />
        </dl>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={level}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: DUR.base, ease: EASE.standard }}
          >
            {level === "simple" ? (
              <dl className="mt-4 border-t border-line pt-3 font-mono text-[12px]">
                <Field label={t("condition")} value={t("conditionGood")} wide />
              </dl>
            ) : null}

            {level === "detailed" ? (
              <dl className="mt-4 grid grid-cols-2 gap-x-8 border-t border-line pt-3 font-mono text-[12px]">
                <Field label={t("stateOfCharge")} value={`${batteryDemo.soc} %`} />
                <Field label={t("cellDelta")} value={`${batteryDemo.cellDelta} mV`} />
                <Field label={t("packVoltage")} value={`${batteryDemo.packVoltage.toFixed(1)} V`} />
                <Field
                  label={t("usableCapacity")}
                  value={`${batteryDemo.capacityEstimated} / ${batteryDemo.capacityNominal} kWh`}
                />
                <Field
                  label={t("packTemp")}
                  value={`${batteryDemo.tempMin.toFixed(1)} to ${batteryDemo.tempMax.toFixed(1)} °C`}
                  wide
                />
              </dl>
            ) : null}

            {level === "engineering" ? (
              <div className="mt-4 border-t border-line pt-3">
                <div className="mb-2 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                  {t("howRead")}
                </div>
                <ol className="space-y-0 font-mono text-[12px]">
                  <ProvenanceStep label={t("provReportedBy")} value={t("provBms")} sub="BECM" />
                  <ProvenanceStep label={t("provReadVia")} value={t("provUdsDoip")} sub={t("provSession")} />
                  <ProvenanceStep label={t("provDecodedAgainst")} value={t("provCmaMap")} sub={t("provNotScaled")} />
                  <ProvenanceStep label={t("provRefresh")} value={t("provOnDemand")} sub={t("provPolled")} last />
                </ol>
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
      </div>
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between border-b border-line py-1.5 last:border-0", wide && "col-span-2")}>
      <dt className="text-text-secondary">{label}</dt>
      <dd className="tnum text-text-primary">{value}</dd>
    </div>
  );
}

function ProvenanceStep({
  label,
  value,
  sub,
  last,
}: {
  label: string;
  value: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <li className="flex gap-3 py-1.5">
      <span aria-hidden className="mt-1 flex flex-col items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {!last ? <span className="mt-0.5 h-4 w-px bg-line-strong" /> : null}
      </span>
      <span>
        <span className="text-text-muted">{label}</span>{" "}
        <span className="text-text-primary">{value}</span>
        <span className="block text-[10.5px] text-text-muted">{sub}</span>
      </span>
    </li>
  );
}
