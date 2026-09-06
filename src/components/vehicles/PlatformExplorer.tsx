"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { DUR, EASE } from "@/lib/motion";
import {
  capStatusMeta,
  platformMeta,
  platformsInOrder,
  statusMeta,
  vehicles,
  type Capability,
  type Platform,
  type VehicleSupport,
} from "@/lib/vehicles";
import { cn } from "@/lib/cn";

const CAP_ORDER: Capability[] = [
  "connection",
  "ecu-discovery",
  "dtc-scan",
  "battery-soh",
  "cell-potentials",
  "live-data",
  "service-routines",
];

export function PlatformExplorer({ defaultPlatform = "CMA" as Platform }) {
  const reduce = useReducedMotion();
  const t = useTranslations("platforms");
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [selected, setSelected] = useState<string | null>(null);

  const list = useMemo(() => vehicles.filter((v) => v.platform === platform), [platform]);
  const active = list.find((v) => v.model === selected) ?? list[0];
  const pm = platformMeta[platform];

  return (
    <div>
      <ToggleGroup.Root
        type="single"
        value={platform}
        onValueChange={(v) => {
          if (!v) return;
          setPlatform(v as Platform);
          setSelected(null);
        }}
        aria-label={t("platformAria")}
        className="inline-flex flex-wrap gap-1 rounded-sm border border-line-strong bg-surface p-0.5 font-mono text-[13px]"
      >
        {platformsInOrder.map((p) => (
          <ToggleGroup.Item
            key={p}
            value={p}
            className="rounded-[2px] px-3 py-1.5 text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
          >
            {platformMeta[p].label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusMarker tone={statusMeta[pm.status].tone}>{t(`status.${pm.status}`)}</StatusMarker>
        <p className="max-w-xl text-[14px] leading-relaxed text-text-secondary">{t(`blurbs.${platform}`)}</p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* Vehicle list */}
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.ul
              key={platform}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: DUR.fast }}
              className="divide-y divide-line border-y border-line"
            >
              {list.map((v, i) => {
                const isActive = active?.model === v.model;
                return (
                  <motion.li
                    key={v.model}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.base, delay: reduce ? 0 : i * 0.04, ease: EASE.out }}
                  >
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelected(v.model)}
                      className={cn(
                        "flex w-full items-baseline justify-between gap-4 py-3.5 text-left transition-colors",
                        isActive ? "text-text-primary" : "hover:text-text-primary",
                      )}
                    >
                      <span>
                        <span className="text-[15px] text-text-primary">{v.model}</span>
                        <span className="block font-mono text-[12px] text-text-muted">
                          {v.manufacturer} &middot; {v.powertrain} &middot; {v.years}
                        </span>
                      </span>
                      <StatusMarker tone={statusMeta[v.status].tone}>
                        {t(`status.${v.status}`)}
                      </StatusMarker>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>

        {/* Capability breakdown */}
        <div className="rounded-lg border border-line bg-surface p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active?.model ?? "none"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: DUR.base, ease: EASE.standard }}
            >
              {active ? <VehicleDetail v={active} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function VehicleDetail({ v }: { v: VehicleSupport }) {
  const t = useTranslations("platforms");
  const caps = CAP_ORDER.filter((c) => v.capabilities[c] !== undefined);
  return (
    <div>
      <div className="text-[16px] font-medium text-text-primary">{v.model}</div>
      <dl className="mt-3 grid grid-cols-2 gap-x-8 border-y border-line py-3 font-mono text-[12px]">
        <Row label={t("platformLabel")} value={v.platform} />
        <Row label={t("powertrainLabel")} value={v.powertrain} />
        <Row label={t("statusLabel")} value={t(`status.${v.status}`)} />
        <Row label={t("modelYearsLabel")} value={v.years} />
      </dl>
      {v.note ? <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{v.note}</p> : null}

      <div className="mt-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {t("verifiedFunctions")}
      </div>
      <ul className="mt-2 divide-y divide-line border-t border-line">
        {caps.map((c) => {
          const st = v.capabilities[c]!;
          return (
            <li key={c} className="flex items-center justify-between py-2 text-[13px]">
              <span className="text-text-secondary">{t(`capLabels.${c}`)}</span>
              <StatusMarker tone={capStatusMeta[st].tone}>{t(`capStatus.${st}`)}</StatusMarker>
            </li>
          );
        })}
      </ul>

      {v.research?.length ? (
        <div className="mt-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            {t("currentResearch")}
          </div>
          <ul className="mt-2 space-y-1 text-[13px] text-text-secondary">
            {v.research.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="mt-[9px] h-px w-2 shrink-0 bg-line-strong" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}

export function StatusLegend() {
  const t = useTranslations("platforms");
  const order = ["supported", "partial", "testing", "wip", "research", "planned"] as const;
  return (
    <dl className="space-y-3">
      {order.map((k) => (
        <div key={k} className="border-l border-line pl-3">
          <dt>
            <StatusMarker tone={statusMeta[k].tone}>{t(`status.${k}`)}</StatusMarker>
          </dt>
          <dd className="mt-1 text-[13px] leading-relaxed text-text-secondary">{t(`statusNotes.${k}`)}</dd>
        </div>
      ))}
    </dl>
  );
}
