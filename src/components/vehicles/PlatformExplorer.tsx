"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  supportBucket,
  vehicleAnchor,
  vehicles,
  type Capability,
  type Platform,
  type SupportBucket,
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

type BucketFilter = "all" | SupportBucket;
const BUCKETS: BucketFilter[] = ["all", "tested", "catalogued", "exploring"];

export function PlatformExplorer({ defaultPlatform = "CMA" as Platform }) {
  const reduce = useReducedMotion();
  const t = useTranslations("platforms");
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [selected, setSelected] = useState<string | null>(null);
  const [bucket, setBucket] = useState<BucketFilter>("all");
  // The URL hash only changes once the visitor picks a car; loading the page
  // must not rewrite it.
  const interacted = useRef(false);

  // Deep links: /vehicles#volvo-ex30 (a car) or /vehicles#sea (a platform).
  // The hash is readable only in the browser, so the initial state cannot
  // carry it; one mount-time sync is the honest place.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!h) return;
    const v = vehicles.find((x) => vehicleAnchor(x) === h);
    if (v) {
      setPlatform(v.platform);
      setSelected(v.model);
      return;
    }
    const p = h.toUpperCase();
    if ((platformsInOrder as string[]).includes(p)) setPlatform(p as Platform);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const list = useMemo(
    () =>
      vehicles.filter(
        (v) => v.platform === platform && (bucket === "all" || supportBucket(v.status) === bucket),
      ),
    [platform, bucket],
  );
  const allOnPlatform = useMemo(() => vehicles.filter((v) => v.platform === platform), [platform]);
  const active = list.find((v) => v.model === selected) ?? list[0] ?? null;
  const pm = platformMeta[platform];

  useEffect(() => {
    if (!interacted.current || !active) return;
    window.history.replaceState(null, "", `#${vehicleAnchor(active)}`);
  }, [active]);

  const pick = (v: VehicleSupport) => {
    interacted.current = true;
    setSelected(v.model);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup.Root
          type="single"
          value={platform}
          onValueChange={(v) => {
            if (!v) return;
            interacted.current = true;
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
              className="rounded-[2px] px-3 py-1.5 press text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
            >
              {platformMeta[p].label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <ToggleGroup.Root
          type="single"
          value={bucket}
          onValueChange={(v) => {
            if (!v) return;
            interacted.current = true;
            setBucket(v as BucketFilter);
            setSelected(null);
          }}
          aria-label={t("filterAria")}
          className="inline-flex flex-wrap gap-px rounded-sm border border-line bg-line text-[12px]"
        >
          {BUCKETS.map((b) => (
            <ToggleGroup.Item
              key={b}
              value={b}
              className={cn(
                "px-2.5 py-1.5 bg-surface font-mono uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary",
                "data-[state=on]:bg-bg-secondary data-[state=on]:text-text-primary",
              )}
            >
              {b === "all" ? t("filterAll") : t(`filter.${b}`)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusMarker tone={statusMeta[pm.status].tone}>{t(`status.${pm.status}`)}</StatusMarker>
        <p className="max-w-[36rem] text-[14px] leading-relaxed text-text-secondary">{t(`blurbs.${platform}`)}</p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* Vehicle list */}
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.length > 0 ? (
              <motion.ul
                key={`${platform}-${bucket}`}
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
                      id={vehicleAnchor(v)}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DUR.base, delay: reduce ? 0 : i * 0.04, ease: EASE.out }}
                      className="scroll-mt-24"
                    >
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => pick(v)}
                        className={cn(
                          "flex w-full items-baseline justify-between gap-4 py-3.5 text-left transition-colors",
                          isActive ? "text-text-primary" : "hover:text-text-primary",
                        )}
                      >
                        <span>
                          <span className="text-[15px] text-text-primary">{v.model}</span>
                          <span className="block font-mono text-[12px] text-text-muted">
                            {v.manufacturer} / {v.powertrain} / {v.years}
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
            ) : (
              <motion.p
                key={`${platform}-${bucket}-empty`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-y border-line bg-surface px-4 py-8 text-center text-[13px] text-text-muted"
                role="status"
              >
                {t("filterEmpty", { platform, count: allOnPlatform.length })}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Capability breakdown */}
        <div className="rounded-sm border border-line bg-surface p-6">
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
