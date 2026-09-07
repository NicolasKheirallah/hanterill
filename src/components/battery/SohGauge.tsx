"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { DUR, EASE } from "@/lib/motion";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * State-of-health dial. A ~280-degree arc with a gap at the bottom; the bronze
 * value arc sweeps in the first time it is seen (skipped under reduced motion).
 * The figure in the middle is a button - it opens where the value comes from.
 */
export function SohGauge({ value, size = 124 }: { value: number; size?: number }) {
  const t = useTranslations("battery");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const R = 50;
  const C = 2 * Math.PI * R;
  const SWEEP = 0.78; // fraction of the circle that is drawn (~281 deg)
  const arc = C * SWEEP;
  const pct = clamp01(value / 100);
  const revealed = reduce || inView;

  return (
    <div ref={ref} className="shrink-0">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="press group flex flex-col items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span className="relative block" style={{ width: size, height: size }}>
              <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-hidden>
                <g transform="rotate(129 60 60)">
                  <circle
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${arc} ${C}`}
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${arc} ${C}`}
                    initial={reduce ? false : { strokeDashoffset: arc }}
                    animate={{ strokeDashoffset: revealed ? arc * (1 - pct) : arc }}
                    transition={{ duration: 1, ease: EASE.out }}
                  />
                </g>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className="tnum font-mono leading-none text-text-primary"
                  style={{ fontSize: Math.round(size * 0.24) }}
                >
                  {value.toFixed(1)}
                  <span
                    className="align-top text-text-secondary"
                    style={{ fontSize: Math.round(size * 0.12) }}
                  >
                    %
                  </span>
                </span>
              </span>
            </span>
            <span className="-mt-2 font-mono text-[9px] uppercase tracking-wider text-text-muted transition-colors group-hover:text-text-secondary">
              {t("howRead")}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={10}
            align="center"
            className="z-50 w-64 rounded-sm border border-line-strong bg-surface p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            asChild
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.fast, ease: EASE.out }}
            >
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                {t("howRead")}
              </div>
              <Provenance t={t} />
              <Link
                href="/docs/battery-diagnostics"
                className="mt-2.5 inline-block font-mono text-[11px] text-accent transition-colors hover:text-accent-hover"
              >
                {t("didReference")}
              </Link>
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export function Provenance({ t }: { t: ReturnType<typeof useTranslations<"battery">> }) {
  return (
    <ol className="space-y-0 font-mono text-[12px]">
      <ProvenanceStep label={t("provReportedBy")} value={t("provBms")} sub="BECM" />
      <ProvenanceStep label={t("provReadVia")} value={t("provUdsDoip")} sub={t("provSession")} />
      <ProvenanceStep label={t("provDecodedAgainst")} value={t("provCmaMap")} sub={t("provNotScaled")} />
      <ProvenanceStep label={t("provRefresh")} value={t("provOnDemand")} sub={t("provPolled")} last />
    </ol>
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
