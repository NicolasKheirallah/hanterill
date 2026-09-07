"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { batteryDemo, cellOffsets, cellVoltage, moduleStats, type ModuleStats } from "@/lib/demo-data";
import { DUR, EASE, SPRING } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useModuleSelection } from "./selection-context";

type ViewMode = "voltage" | "deviation" | "module";
/** m or g of -1 means "whole row" / "whole column". */
type Coord = { m: number; g: number };
type T = ReturnType<typeof useTranslations<"battery">>;

const M = batteryDemo.modules;
const G = batteryDemo.groupsPerModule;
const idx = (m: number, g: number) => (m - 1) * G + (g - 1);
/** Per-module spread in mV, fixed for the sample data. */
const moduleDeltas: number[] = Array.from({ length: M }, (_, i) => moduleStats(i + 1).delta);

const VIEW_KEY: Record<ViewMode, "viewVoltage" | "viewDeviation" | "viewModule"> = {
  voltage: "viewVoltage",
  deviation: "viewDeviation",
  module: "viewModule",
};

const WARN_FILL = "color-mix(in srgb, var(--status-warning) 45%, var(--line))";
const OVER_FILL = "color-mix(in srgb, var(--status-error) 50%, var(--line))";

/**
 * Cell fill by view mode:
 * - voltage: flat neutral, the matrix is just a picker for exact values
 * - deviation: heat by this potential's offset from the pack mean
 * - module: heat by the whole module's spread, so imbalanced modules read as
 *   vertical bands
 */
function fill(offset: number, mode: ViewMode, moduleDelta: number): string {
  if (mode === "voltage") return "var(--line-strong)";
  if (mode === "module") {
    if (moduleDelta <= 5) return "var(--line-strong)";
    if (moduleDelta <= 8) return WARN_FILL;
    return OVER_FILL;
  }
  const a = Math.abs(offset);
  if (a <= 3) return "var(--line-strong)";
  if (a <= 5) return WARN_FILL;
  return OVER_FILL;
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
  // One-shot: the cells sweep in across the pack the first time the grid enters
  // view. CSS carries the stagger; this only arms it.
  const revealed = useInView(gridRef, { once: true, amount: 0.15 });

  // Shared module selection with the optional 3D pack view on
  // /features/battery-health. Falls back to local state elsewhere.
  const { module: extModule, setModule: setExtModule } = useModuleSelection();
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Select a cell and mirror its module to the shared selection.
  const pick = useCallback(
    (coord: Coord | null) => {
      setSelected(coord);
      setExtModule(coord && coord.m > 0 ? coord.m : null);
    },
    [setExtModule],
  );
  const pickMobile = useCallback(
    (m: number) => {
      setMobileModule(m);
      setExtModule(m);
    },
    [setExtModule],
  );

  // React to an external module selection (from the 3D pack).
  useEffect(() => {
    const cur = selectedRef.current;
    if (extModule == null) {
      if (cur) setSelected(null);
      return;
    }
    if (extModule !== cur?.m) {
      setSelected({ m: extModule, g: cur?.g ?? 1 });
      setMobileModule(extModule);
    }
  }, [extModule]);

  const focusCell = useCallback((m: number, g: number) => {
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${m}-${g}"]`)?.focus();
  }, []);

  const onCellKey = (e: React.KeyboardEvent, m: number, g: number) => {
    let nm = m;
    let ng = g;
    switch (e.key) {
      // Modules run left to right (pack position); groups stack top to bottom.
      case "ArrowRight": nm = Math.min(M, m + 1); break;
      case "ArrowLeft": nm = Math.max(1, m - 1); break;
      case "ArrowDown": ng = Math.min(G, g + 1); break;
      case "ArrowUp": ng = Math.max(1, g - 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick({ m, g });
        return;
      case "Escape":
        pick(null);
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
  // A pointed-at (or selected) individual potential - not a whole row/column.
  const activeCell =
    active && active.m > 0 && active.g > 0 ? { m: active.m, g: active.g } : null;
  const activeOffset = activeCell ? cellOffsets[idx(activeCell.m, activeCell.g)] : 0;
  const detail = useMemo<ModuleStats | null>(
    () => (selected ? moduleStats(selected.m) : activeModule ? moduleStats(activeModule) : null),
    [selected, activeModule],
  );
  const scaleValue =
    detail && (selected || (active && (active.m === -1 || active.g === -1))) ? detail.avg : null;

  return (
    <section className="border-b border-line bg-bg-secondary py-2xl lg:py-3xl">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title={t("matrixTitle")} lead={t("matrixLead")} />
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

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.85fr_1fr] lg:gap-14">
          <div className="hidden min-w-0 sm:block">
            <div className="bezel bg-surface p-4 sm:p-5">
              {/* Live read-out: the pointed-at potential, right where you are
                  looking, so you never have to track the side panel. */}
              <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-line pb-2 font-mono text-[11px]">
                <span className="uppercase tracking-wider text-text-muted">{t("spread")}</span>
                <span aria-live="polite" className="tnum text-right">
                  {activeCell ? (
                    <>
                      <span className="text-text-primary">
                        M{String(activeCell.m).padStart(2, "0")} G{activeCell.g}
                      </span>
                      <span className="mx-2 text-text-secondary">
                        {cellVoltage(idx(activeCell.m, activeCell.g)).toFixed(3)} V
                      </span>
                      <span
                        className={cn(
                          Math.abs(activeOffset) > 5
                            ? "text-status-error"
                            : Math.abs(activeOffset) > 3
                              ? "text-status-warning"
                              : "text-text-muted",
                        )}
                      >
                        {activeOffset >= 0 ? "+" : ""}
                        {activeOffset} mV
                      </span>
                    </>
                  ) : (
                    <span className="text-text-muted">
                      &Delta; {batteryDemo.cellDelta} mV / {M * G}
                    </span>
                  )}
                </span>
              </div>
              <div className="overflow-x-auto">
              <div
                ref={gridRef}
                role="grid"
                aria-label={t("gridAria")}
                className="min-w-[620px]"
                data-mx-reveal={revealed ? "" : undefined}
                onMouseLeave={() => setHover(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(null);
                }}
                style={{ ["--mx-cols" as string]: `2rem repeat(${M}, minmax(0, 1fr))` }}
              >
                {/* Module-number header. Modules run left to right along the pack. */}
                <div
                  role="row"
                  className="grid gap-[2px] pb-1"
                  style={{ gridTemplateColumns: "var(--mx-cols)" }}
                >
                  <span />
                  {Array.from({ length: M }, (_, mi) => {
                    const m = mi + 1;
                    return (
                      <button
                        key={m}
                        type="button"
                        onMouseEnter={() => setHover({ m, g: -1 })}
                        onFocus={() => setHover({ m, g: -1 })}
                        onClick={() => pick({ m, g: selected?.m === m ? selected.g : 1 })}
                        className={cn(
                          "min-w-0 py-0.5 text-center font-mono text-[9px] tabular-nums leading-none transition-colors",
                          active?.m === m ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
                        )}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>

                {/* One row per cell group. */}
                {Array.from({ length: G }, (_, gi) => {
                  const g = gi + 1;
                  const rowActive = exploring?.g === g;
                  return (
                    <div
                      key={g}
                      role="row"
                      className="grid gap-[2px] pb-[2px]"
                      style={{ gridTemplateColumns: "var(--mx-cols)" }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setHover({ m: -1, g })}
                        onFocus={() => setHover({ m: -1, g })}
                        onClick={() => pick({ m: selected?.g === g ? selected.m : 1, g })}
                        className={cn(
                          "flex items-center pr-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                          rowActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary",
                        )}
                      >
                        G{g}
                      </button>
                      {Array.from({ length: M }, (_, mi) => {
                        const m = mi + 1;
                        const i = idx(m, g);
                        const off = cellOffsets[i];
                        const colActive = exploring?.m === m;
                        const isCell = active?.m === m && active?.g === g;
                        const isSelected = selected?.m === m && selected?.g === g;
                        const emphasised = rowActive || colActive;
                        return (
                          <button
                            key={m}
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
                            onClick={() => pick({ m, g })}
                            onKeyDown={(e) => onCellKey(e, m, g)}
                            className={cn(
                              "mx-cell h-6 min-w-0 rounded-[1px] outline-none ring-inset transition-[box-shadow,transform] duration-150 will-change-transform",
                              emphasised && !isCell && !isSelected && "ring-1 ring-text-primary/25",
                              isCell && "relative z-10 scale-[1.14]",
                              isSelected && "ring-2 ring-accent",
                              isCell && !isSelected && "ring-1 ring-text-primary",
                            )}
                            style={{
                              background: fill(off, mode, moduleDeltas[m - 1]),
                              ["--mx-d" as string]: `${(m - 1) * 9 + (g - 1) * 22}ms`,
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
            <Legend mode={mode} />
          </div>

          <div className="sm:hidden">
            <MobileModules selected={mobileModule} onSelect={pickMobile} mode={mode} />
          </div>

          <div className="bezel bg-surface p-6">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("pack")}</div>
              {selected ? (
                <button
                  type="button"
                  onClick={() => {
                    pick(null);
                    setHover(null);
                  }}
                  className="font-mono text-[11px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  {t("clearSelection")}
                </button>
              ) : null}
            </div>
            <PackScale mean={batteryDemo.avgCellGroup} value={scaleValue} />

            {/* Height is reserved so the panel does not collapse (and the bezel
                notch does not jump) as you move between pack / module / cell. */}
            <div className="mt-5 hidden min-h-[15.5rem] sm:block">
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
                  onClick={() => pickMobile(Math.max(1, mobileModule - 1))}
                  className="text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  {t("previousModule")}
                </button>
                <button
                  type="button"
                  disabled={mobileModule >= M}
                  onClick={() => pickMobile(Math.min(M, mobileModule + 1))}
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
  const swatches: [string, string][] =
    mode === "module"
      ? [
          ["var(--line-strong)", `${t("moduleSpread")}, within 5 mV`],
          [WARN_FILL, "5 to 8 mV"],
          [OVER_FILL, "over 8 mV"],
        ]
      : [
          ["var(--line-strong)", t("withinLegend")],
          [WARN_FILL, t("midLegend")],
          [OVER_FILL, t("overLegend")],
        ];
  return (
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-text-muted">
      {swatches.map(([sw, label]) => (
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
    <div className="rounded-sm border border-line bg-surface">
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
        ) : (
          // Idle: a muted marker sits on the mean so the scale reads as
          // complete rather than an empty track.
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line-strong" />
        )}
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
