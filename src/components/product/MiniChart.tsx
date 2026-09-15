"use client";
import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-motion-prefs";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

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
 *
 * The live dot is a CSS animation on an HTML element, not an SVG `<animate>`.
 * SMIL is invisible to the reduced-motion contract in globals.css (it is not
 * a CSS animation), and gating it on `useReducedMotion()` during render broke
 * hydration: the hook is null on the server and already true on the client's
 * first pass, so React found an `<animate>` element in the SSR output that
 * the client had not rendered. Two reasons to keep it in CSS.
 */
export function MiniChart({ data, min, max, unit, label, height = 120, className, live = false }: Props) {
  // Resolved after mount so the server and the first client render agree.
  const reduce = useReducedMotionSafe();
  const animate = !reduce;

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

  // The dot is positioned as a percentage of the SVG box, so it stays glued to
  // the end of the trace as the viewBox stretches.
  const lastPoint = points[points.length - 1];

  return (
    <figure className={cn("relative", className)}>
      {label ? (
        <figcaption className="mb-1.5 flex items-baseline justify-between font-mono text-[length:var(--text-micro)] text-text-muted">
          <span className="uppercase tracking-[length:var(--track-label)]">{label}</span>
          <span className="tnum text-text-secondary">
            {last?.toFixed(1)}
            {unit ? ` ${unit}` : ""}
          </span>
        </figcaption>
      ) : null}
      <div className="relative">
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
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <g clipPath={`url(#${clipId})`}>
            {/* Keyed on `animate`: the pre-mount and reduced-motion render is
                a static full-length line (identical on the server and the
                client's first pass, so hydration matches), and the mount-time
                re-key is what plays the one-off draw. */}
            <motion.path
              key={animate ? "draw" : "static"}
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={animate ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: animate ? 0.9 : 0, ease: EASE.standard }}
            />
          </g>
        </svg>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent",
            // `live` is what marks this as a running trace; the pulse class is
            // the extra signal, and it is dropped under reduced motion.
            live && animate && "motion-safe:animate-pulse-dot",
            live && !animate && "opacity-70",
          )}
          style={{
            left: `${(lastPoint[0] / w) * 100}%`,
            top: `${(lastPoint[1] / h) * 100}%`,
          }}
        />
      </div>
    </figure>
  );
}
