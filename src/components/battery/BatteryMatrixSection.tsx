"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { batteryDemo, cellOffsets, cellVoltage, moduleStats, type ModuleStats } from "@/lib/demo-data";
import { DUR, EASE, SPRING } from "@/lib/motion";
import { cn } from "@/lib/cn";

type ViewMode = "voltage" | "deviation" | "module";
/** m or g of -1 means "whole row" / "whole column". */
type Coord = { m: number; g: number };
type T = ReturnType<typeof useTranslations<"battery">>;

const M = batteryDemo.modules;
const G = batteryDemo.groupsPerModule;
const idx = (m: number, g: number) => (m - 1) * G + (g - 1);

const VIEW_KEY: Record<ViewMode, "viewVoltage" | "viewDeviation" | "viewModule"> = {
  voltage: "viewVoltage",
  deviation: "viewDeviation",
  module: "viewModule",
};

function fill(offset: number, mode: ViewMode): string {
  if (mode === "voltage") return "var(--line-strong)";
  const a = Math.abs(offset);
  if (a <= 3) return "var(--line-strong)";
  if (a <= 5) return "color-mix(in srgb, var(--status-warning) 45%, var(--line))";
  return "color-mix(in srgb, var(--status-error) 50%, var(--line))";
}

function srText(t: T, m: number, g: number) {
  const off = cellOffsets[idx(m, g)];
  const relation =
    off === 0
      ? t("srAtAverage")
      : t("srOffset", { mv: Math.abs(off), direction: off > 0 ? t("srAbove") : t("srBelow") });
  return t("srCell", {
    module: m,
    group: g,
    volts: cellVoltage(idx(m, g)).toFixed(3),
    relation,
  });
}

export function BatteryMatrixSection() {
  const reduce = useReducedMotion();
  const t = useTranslations("battery");
  const [mode, setMode] = useState<ViewMode>("deviation");
  const [selected, setSelected] = useState<Coord | null>(null);
  const [hover, setHover] = useState<Coord | null>(null);
  const [mobileModule, setMobileModule] = useState(14);
  const gridRef = useRef<HTMLDivElement>(null);

  const focusCell = useCallback((m: number, g: number) => {
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${m}-${g}"]`)?.focus();
  }, []);

  const onCellKey = (e: React.KeyboardEvent, m: number, g: number) => {
    let nm = m;
    let ng = g;
    switch (e.key) {
      case "ArrowRight": ng = Math.min(G, g + 1); break;
      case "ArrowLeft": ng = Math.max(1, g - 1); break;
      case "ArrowDown": nm = Math.min(M, m + 1); break;
      case "ArrowUp": nm = Math.max(1, m - 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        setSelected({ m, g });
        return;
      case "Escape":
        setSelected(null);
        setHover(null);
        return;
      default:
        return;
    }
    e.preventDefault();
    focusCell(nm, ng);
    setHover({ m: nm, g: ng });
  };

  const active = hover ?? selected;
  // Row/column emphasis and dimming only while exploring (hover). A persistent
  // selection just rings its cell so the matrix stays readable at rest.
  const exploring = hover;
  const activeModule = active && active.m > 0 ? active.m : null;
  const detail = useMemo<ModuleStats | null>(
    () => (selected ? moduleStats(selected.m) : activeModule ? moduleStats(activeModule) : null),
    [selected, activeModule],
  );
  const scaleValue =
    detail && (selected || (active && (active.m === -1 || active.g === -1))) ? detail.avg : null;

  return (
    <section className="border-b border-line bg-bg-secondary py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t("eyebrow")} title={t("matrixTitle")} lead={t("matrixLead")} />
          <ToggleGroup.Root
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as ViewMode)}
            aria-label={t("matrixViewAria")}
            className="inline-flex shrink-0 self-start rounded-sm border border-line-strong bg-surface p-0.5 font-mono text-[12px]"
          >
            {(["voltage", "deviation", "module"] as ViewMode[]).map((v) => (
              <ToggleGroup.Item
                key={v}
                value={v}
                className="rounded-[2px] px-2.5 py-1.5 press text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
              >
                {t(VIEW_KEY[v])}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
          <div className="hidden min-w-0 sm:block">
            <div className="overflow-x-auto rounded-lg border border-line bg-surface p-4 sm:p-6">
              <div
                ref={gridRef}
                role="grid"
                aria-label={t("gridAria")}
                className="min-w-[440px]"
                onMouseLeave={() => setHover(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(null);
                }}
              >
                <div
                  role="row"
                  className="grid gap-[3px] pb-1"
                  style={{ gridTemplateColumns: `2.5rem repeat(${G}, 1fr)` }}
                >
                  <span />
                  {Array.from({ length: G }, (_, gi) => {
                    const g = gi + 1;
                    return (
                      <button
                        key={g}
                        type="button"
                        onMouseEnter={() => setHover({ m: -1, g })}
                        onFocus={() => setHover({ m: -1, g })}
                        className={cn(
                          "rounded-[2px] py-0.5 text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
                          active?.g === g ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
                        )}
                      >
                        G{g}
                      </button>
                    );
                  })}
                </div>

                {Array.from({ length: M }, (_, mi) => {
                  const m = mi + 1;
                  const rowActive = exploring?.m === m;
                  return (
                    <div
                      key={m}
                      role="row"
                      className={cn("grid gap-[3px]", mode === "module" && "mb-1 last:mb-0")}
                      style={{ gridTemplateColumns: `2.5rem repeat(${G}, 1fr)` }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setHover({ m, g: -1 })}
                        onFocus={() => setHover({ m, g: -1 })}
                        onClick={() => setSelected({ m, g: selected?.m === m ? selected.g : 1 })}
                        className={cn(
                          "flex items-center pr-2 font-mono text-[10px] transition-colors",
                          rowActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
                        )}
                      >
                        M{String(m).padStart(2, "0")}
                      </button>
                      {Array.from({ length: G }, (_, gi) => {
                        const g = gi + 1;
                        const i = idx(m, g);
                        const off = cellOffsets[i];
                        const colActive = exploring?.g === g;
                        const isCell = active?.m === m && active?.g === g;
                        const isSelected = selected?.m === m && selected?.g === g;
                        const emphasised = rowActive || colActive;
                        const dimmed = Boolean(exploring) && !emphasised;
                        return (
                          <button
                            key={g}
                            type="button"
                            role="gridcell"
                            data-cell={`${m}-${g}`}
                            tabIndex={
                              (selected ? selected.m === m && selected.g === g : m === 1 && g === 1) ? 0 : -1
                            }
                            aria-label={srText(t, m, g)}
                            aria-selected={isSelected}
                            onMouseEnter={() => setHover({ m, g })}
                            onFocus={() => setHover({ m, g })}
                            onClick={() => setSelected({ m, g })}
                            onKeyDown={(e) => onCellKey(e, m, g)}
                            className={cn(
                              "h-5 rounded-[2px] outline-none transition-[opacity,box-shadow] duration-150",
                              dimmed && "opacity-35",
                              isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                              isCell && !isSelected && "ring-1 ring-text-primary",
                            )}
                            style={{ background: fill(off, mode) }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <Legend mode={mode} />
          </div>

          <div className="sm:hidden">
            <MobileModules selected={mobileModule} onSelect={setMobileModule} mode={mode} />
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("pack")}</div>
              {selected ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setHover(null);
                  }}
                  className="font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  {t("clearSelection")}
                </button>
              ) : null}
            </div>
            <PackScale mean={batteryDemo.avgCellGroup} value={scaleValue} />

            <div className="mt-5 hidden sm:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    selected
                      ? `s-${selected.m}-${selected.g}`
                      : detail
                        ? `m-${detail.module}`
                        : "pack"
                  }
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: DUR.base, ease: EASE.standard }}
                >
                  {selected && detail ? (
                    <SelectedDetail detail={detail} group={selected.g} />
                  ) : detail ? (
                    <ModuleSummary detail={detail} />
                  ) : (
                    <PackSummary />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile: mirror the selected module */}
            <div className="mt-5 sm:hidden">
              <ModuleSummary detail={moduleStats(mobileModule)} />
              <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-[11px]">
                {moduleStats(mobileModule).groups.map((g) => (
                  <div key={g.group} className="rounded-sm border border-line px-1.5 py-1.5 text-center">
                    <div className="text-text-muted">G{g.group}</div>
                    <div className="tnum mt-0.5 text-text-primary">{g.voltage.toFixed(3)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[12px]">
                <button
                  type="button"
                  disabled={mobileModule <= 1}
                  onClick={() => setMobileModule((m) => Math.max(1, m - 1))}
                  className="text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  {t("previousModule")}
                </button>
                <button
                  type="button"
                  disabled={mobileModule >= M}
                  onClick={() => setMobileModule((m) => Math.min(M, m + 1))}
                  className="text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  {t("nextModule")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Legend({ mode }: { mode: ViewMode }) {
  const t = useTranslations("battery");
  if (mode === "voltage")
    return <p className="mt-3 font-mono text-[11px] text-text-muted">{t("voltageLegend")}</p>;
  return (
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-text-muted">
      {[
        ["var(--line-strong)", t("withinLegend")],
        ["color-mix(in srgb, var(--status-warning) 45%, var(--line))", t("midLegend")],
        ["color-mix(in srgb, var(--status-error) 50%, var(--line))", t("overLegend")],
      ].map(([sw, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-[1px]" style={{ background: sw }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function MobileModules({
  selected,
  onSelect,
  mode,
}: {
  selected: number;
  onSelect: (m: number) => void;
  mode: ViewMode;
}) {
  const t = useTranslations("battery");
  return (
    <div className="rounded-lg border border-line bg-surface">
      <ul className="max-h-[19rem] divide-y divide-line overflow-y-auto">
        {Array.from({ length: M }, (_, mi) => {
          const m = mi + 1;
          const s = moduleStats(m);
          return (
            <li key={m}>
              <button
                type="button"
                aria-pressed={selected === m}
                onClick={() => onSelect(m)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                  selected === m ? "bg-bg-secondary" : "hover:bg-bg-secondary/60",
                )}
              >
                <span className="font-mono text-[13px] text-text-primary">M{String(m).padStart(2, "0")}</span>
                <span className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="tnum text-text-secondary">{s.avg.toFixed(3)} V</span>
                  <span className={cn("tnum", s.delta > 8 ? "text-status-warning" : "text-text-muted")}>
                    &Delta; {s.delta} mV
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-line px-4 py-2 font-mono text-[10px] text-text-muted">
        {mode === "voltage" ? t("moduleAvgVoltage") : t("moduleSpread")}. {t("tapModule")}
      </p>
    </div>
  );
}

function PackScale({ mean, value }: { mean: number; value: number | null }) {
  const t = useTranslations("battery");
  const lo = mean - 0.012;
  const hi = mean + 0.012;
  const pct = value == null ? null : Math.max(2, Math.min(98, ((value - lo) / (hi - lo)) * 100));
  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-line">
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-line-strong" />
        {pct != null ? (
          <motion.span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent"
            style={{ marginLeft: "-5px" }}
            animate={{ left: `${pct}%` }}
            transition={SPRING}
          />
        ) : null}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-text-muted">
        <span>-12 mV</span>
        <span className="tnum">{t("scaleMean", { volts: mean.toFixed(3) })}</span>
        <span>+12 mV</span>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-1.5 font-mono text-[12px] last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className={cn("tnum text-text-primary", tone)}>{value}</span>
    </div>
  );
}

function SelectedDetail({ detail, group }: { detail: ModuleStats; group: number }) {
  const t = useTranslations("battery");
  const g = detail.groups.find((x) => x.group === group) ?? detail.groups[0];
  return (
    <div>
      <div className="font-mono text-[12px] uppercase tracking-wider text-text-muted">
        {t("moduleNGroupG", { module: detail.module, group: g.group })}
      </div>
      <div className="tnum mt-3 font-mono text-[2rem] leading-none text-text-primary">
        {g.voltage.toFixed(3)} <span className="text-lg text-text-secondary">V</span>
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-[13px]",
          Math.abs(g.offset) > 5
            ? "text-status-error"
            : Math.abs(g.offset) > 3
              ? "text-status-warning"
              : "text-text-secondary",
        )}
      >
        {g.offset >= 0 ? "+" : ""}
        {g.offset} mV {t("fromPackMean")}
      </div>
      <dl className="mt-5">
        {detail.groups.map((x) => (
          <Row
            key={x.group}
            label={t("groupN", { group: x.group })}
            value={`${x.voltage.toFixed(3)} V`}
            tone={x.group === g.group ? "text-accent" : undefined}
          />
        ))}
        <Row label={t("moduleAverage")} value={`${detail.avg.toFixed(3)} V`} />
        <Row label={t("moduleDelta")} value={`${detail.delta} mV`} />
        <Row label={t("moduleTemperature")} value={`${detail.temp.toFixed(1)} °C`} />
      </dl>
    </div>
  );
}

function ModuleSummary({ detail }: { detail: ModuleStats }) {
  const t = useTranslations("battery");
  return (
    <div>
      <div className="font-mono text-[12px] uppercase tracking-wider text-text-muted">
        {t("moduleN", { module: detail.module })}
      </div>
      <dl className="mt-3">
        <Row label={t("average")} value={`${detail.avg.toFixed(3)} V`} />
        <Row label={t("highest")} value={`${detail.max.toFixed(3)} V`} />
        <Row label={t("lowest")} value={`${detail.min.toFixed(3)} V`} />
        <Row
          label={t("delta")}
          value={`${detail.delta} mV`}
          tone={detail.delta > 8 ? "text-status-warning" : undefined}
        />
        <Row label={t("temperature")} value={`${detail.temp.toFixed(1)} °C`} />
      </dl>
    </div>
  );
}

function PackSummary() {
  const t = useTranslations("battery");
  return (
    <div>
      <p className="text-[14px] leading-relaxed text-text-secondary">{t("hoverHint")}</p>
      <dl className="mt-5">
        <Row label={t("packMean")} value={`${batteryDemo.avgCellGroup.toFixed(3)} V`} />
        <Row label={t("spread")} value={`${batteryDemo.cellDelta} mV`} />
        <Row
          label={t("minMax")}
          value={`${batteryDemo.minCellGroup.toFixed(3)} / ${batteryDemo.maxCellGroup.toFixed(3)} V`}
        />
        <Row
          label={t("packTemp")}
          value={`${batteryDemo.tempMin.toFixed(1)} to ${batteryDemo.tempMax.toFixed(1)} °C`}
        />
      </dl>
    </div>
  );
}
