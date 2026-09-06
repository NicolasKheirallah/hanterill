"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Props = {
  data: number[];
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  height?: number;
  className?: string;
  live?: boolean;
};

/**
 * Engineering-style trace: fixed baseline grid, thin stroke, no rounded
 * container. The stroke draws itself once to signal the chart going live.
 */
export function MiniChart({ data, min, max, unit, label, height = 120, className, live = false }: Props) {
  const reduce = useReducedMotion();
  const clipId = useId();
  const w = 320;
  const h = height;
  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const span = hi - lo || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, h - ((v - lo) / span) * (h - 12) - 6] as const);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  const gridY = [0.25, 0.5, 0.75];

  return (
    <figure className={cn("relative", className)}>
      {label ? (
        <figcaption className="mb-1.5 flex items-baseline justify-between font-mono text-[11px] text-text-muted">
          <span className="uppercase tracking-wider">{label}</span>
          <span className="tnum text-text-secondary">
            {last?.toFixed(1)}
            {unit ? ` ${unit}` : ""}
          </span>
        </figcaption>
      ) : null}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="none"
        role="img"
        aria-label={
          label
            ? `${label} trace, currently ${last?.toFixed(1)}${unit ? ` ${unit}` : ""}, ranging ${lo.toFixed(0)} to ${hi.toFixed(0)}`
            : "data trace"
        }
        className="block"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={w} height={h} />
          </clipPath>
        </defs>
        {gridY.map((g) => (
          <line
            key={g}
            x1="0"
            x2={w}
            y1={h * g}
            y2={h * g}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          <motion.path
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </g>
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill="var(--accent)">
          {live && !reduce ? (
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          ) : null}
        </circle>
      </svg>
    </figure>
  );
}
