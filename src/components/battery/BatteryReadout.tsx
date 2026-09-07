"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { batteryDemo, cellOffsets, cellVoltage } from "@/lib/demo-data";
import { SohGauge } from "./SohGauge";

const G = batteryDemo.groupsPerModule;
const moduleOf = (i: number) => Math.floor(i / G) + 1;
const groupOf = (i: number) => (i % G) + 1;

function segFill(off: number): string {
  const a = Math.abs(off);
  if (a <= 2) return "var(--line-strong)";
  if (a <= 4) return "color-mix(in srgb, var(--accent) 55%, var(--line))";
  return "color-mix(in srgb, var(--status-warning) 60%, var(--line))";
}

/**
 * Landing-page battery block. The state-of-health dial (shared with the
 * features page) plus an interactive strip of all 108 cell-group potentials:
 * point at any bar to read its module, group, voltage and offset from the pack
 * mean. Keyboard: arrows step along the strip, Home/End jump, Escape clears.
 */
export function BatteryReadout() {
  const t = useTranslations("features");
  const stripRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const focusSeg = (i: number) =>
    stripRef.current?.querySelector<HTMLButtonElement>(`[data-seg="${i}"]`)?.focus();

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === "ArrowRight") n = Math.min(cellOffsets.length - 1, i + 1);
    else if (e.key === "ArrowLeft") n = Math.max(0, i - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = cellOffsets.length - 1;
    else if (e.key === "Escape") {
      setActive(null);
      return;
    } else return;
    e.preventDefault();
    setActive(n);
    focusSeg(n);
  };

  const off = active == null ? null : cellOffsets[active];

  return (
    <div className="bezel bg-surface p-6">
      <div className="flex items-center gap-5">
        <SohGauge value={batteryDemo.soh} size={112} />
        <dl className="grid flex-1 grid-cols-3 gap-x-4 gap-y-0 font-mono text-[12px]">
          {[
            ["Min", `${batteryDemo.minCellGroup.toFixed(3)} V`],
            ["Max", `${batteryDemo.maxCellGroup.toFixed(3)} V`],
            ["Delta", `${batteryDemo.cellDelta} mV`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="uppercase tracking-wider text-text-muted">{k}</dt>
              <dd className="tnum mt-1 text-text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <div className="flex items-baseline justify-between font-mono text-[11px]">
          <span className="uppercase tracking-wider text-text-muted">{t("spreadLabel")}</span>
          <span aria-live="polite" className="tnum text-text-secondary">
            {active == null ? (
              <span className="text-text-muted">{cellOffsets.length} potentials</span>
            ) : (
              <>
                <span className="text-text-primary">
                  M{String(moduleOf(active)).padStart(2, "0")} G{groupOf(active)}
                </span>{" "}
                {cellVoltage(active).toFixed(3)} V{" "}
                <span
                  className={cn(
                    Math.abs(off!) > 4
                      ? "text-status-warning"
                      : Math.abs(off!) > 2
                        ? "text-accent"
                        : "text-text-muted",
                  )}
                >
                  {off! >= 0 ? "+" : ""}
                  {off!} mV
                </span>
              </>
            )}
          </span>
        </div>

        <div
          ref={stripRef}
          role="group"
          aria-label={t("spreadLabel")}
          className="mt-2 flex h-9 gap-px overflow-hidden rounded-[1px]"
          onMouseLeave={() => setActive(null)}
        >
          {cellOffsets.map((o, i) => (
            <button
              key={i}
              type="button"
              data-seg={i}
              tabIndex={i === (active ?? 0) ? 0 : -1}
              aria-label={`Module ${moduleOf(i)}, group ${groupOf(i)}, ${cellVoltage(i).toFixed(
                3,
              )} volts, ${Math.abs(o)} millivolts ${o >= 0 ? "above" : "below"} the pack mean`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "min-w-0 flex-1 outline-none ring-inset transition-[box-shadow,transform] duration-150",
                active === i && "relative z-10 scale-y-[1.18] ring-1 ring-text-primary",
              )}
              style={{ background: segFill(o) }}
            />
          ))}
        </div>

        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-text-muted">
          <span>{t("spreadWithin")}</span>
          <span>{t("spreadMid")}</span>
          <span>{t("spreadOver")}</span>
        </div>
      </div>
    </div>
  );
}
