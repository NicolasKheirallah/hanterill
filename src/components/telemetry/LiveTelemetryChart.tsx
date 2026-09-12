"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useInView, useReducedMotion } from "motion/react";
import {
  channelById,
  channels,
  defaultChannels,
  sample,
  type ChannelId,
} from "@/lib/telemetry-sim";
import { cn } from "@/lib/cn";

/** Fixed 15-second window; no speed or window controls - the chart is just live. */
const WINDOW_SEC = 15;
const SERIES_VARS = ["--accent", "--status-info", "--status-warning"] as const;
/** Fallbacks; the real values are read from CSS at draw time (canvas cannot resolve var()). */
const SERIES_COLORS = ["#cb8e72", "#79a9db", "#e3ad4b"];

/**
 * Continuously moving telemetry. The render loop runs on requestAnimationFrame
 * and writes straight to a canvas, so React never re-renders per frame. It
 * starts itself when the section scrolls into view and stops when it scrolls
 * away or under reduced motion (which shows a static window with a slow
 * periodic tick instead). Pointer and keyboard move a read-out crosshair; they
 * do not stop the trace.
 */
export function LiveTelemetryChart() {
  const tl = useTranslations("telemetry");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.3 });

  const label = useCallback((id: ChannelId) => tl(`channelNames.${id}`), [tl]);
  const labelRef = useRef(label);
  useEffect(() => {
    labelRef.current = label;
  }, [label]);
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const [active, setActive] = useState<ChannelId[]>(defaultChannels);

  const clock = useRef({ t: 0, last: 0 });
  const raf = useRef<number | null>(null);
  const hoverX = useRef<number | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);

  // Theme colors are resolved once per theme change, not per frame: canvas
  // cannot read CSS custom properties itself.
  const palette = useRef<{ line: string; lineStrong: string; series: string[] } | null>(null);
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      palette.current = {
        line: cs.getPropertyValue("--line").trim() || "#2e3036",
        lineStrong: cs.getPropertyValue("--line-strong").trim() || "#474a52",
        series: SERIES_VARS.map((v, i) => cs.getPropertyValue(v).trim() || SERIES_COLORS[i]),
      };
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    window.addEventListener("hanterill-theme-change", read);
    return () => {
      mq.removeEventListener("change", read);
      window.removeEventListener("hanterill-theme-change", read);
    };
  }, []);

  // Keyboard point inspection. Moves `hoverX` in ~80 steps across the canvas and
  // mirrors the read-out into an aria-live region. The trace keeps running.
  function inspectByKey(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const w = canvasRef.current?.clientWidth ?? 0;
    if (!w) return;
    const step = w / 80;
    const cur = hoverX.current ?? w;
    let next: number | null = cur;
    switch (e.key) {
      case "ArrowRight": next = Math.min(w, cur + step); break;
      case "ArrowLeft": next = Math.max(0, cur - step); break;
      case "Home": next = 0; break;
      case "End": next = w; break;
      case "Escape":
        hoverX.current = null;
        if (liveRef.current) liveRef.current.textContent = "";
        return;
      default:
        return;
    }
    e.preventDefault();
    hoverX.current = next;
    draw();
    if (liveRef.current && readoutRef.current) {
      liveRef.current.textContent = readoutRef.current.textContent;
    }
  }

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pal = palette.current ?? {
      line: "#2e3036",
      lineStrong: "#474a52",
      series: [...SERIES_COLORS],
    };
    const line = pal.line;
    const lineStrong = pal.lineStrong;
    const seriesColor = (i: number) => pal.series[i % pal.series.length];
    const now = clock.current.t;
    const win = WINDOW_SEC;
    const t0 = Math.max(0, now - win);
    const pad = { l: 4, r: 4, t: 8, b: 8 };
    const px = (t: number) => pad.l + ((t - t0) / (now - t0 || 1)) * (w - pad.l - pad.r);

    // baseline grid
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (const f of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t + f * (h - pad.t - pad.b));
      ctx.lineTo(w - pad.r, pad.t + f * (h - pad.t - pad.b));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const ids = activeRef.current;
    const readout: string[] = [];
    ids.forEach((id, i) => {
      const ch = channelById(id);
      const color = seriesColor(i);
      const py = (v: number) => {
        const n = Math.max(0, Math.min(1, (v - ch.min) / (ch.max - ch.min)));
        return pad.t + (1 - n) * (h - pad.t - pad.b);
      };
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const step = win / 240;
      let first = true;
      for (let t = t0; t <= now; t += step) {
        const x = px(t);
        const y = py(sample(id, t));
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // current dot
      const cy = py(sample(id, now));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(w - pad.r, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      const readT = hoverX.current == null ? now : t0 + (hoverX.current / w) * (now - t0);
      readout.push(
        `${labelRef.current(id)}  ${sample(id, readT).toFixed(ch.decimals)} ${ch.unit}`,
      );
    });

    // crosshair
    if (hoverX.current != null) {
      ctx.strokeStyle = lineStrong;
      ctx.beginPath();
      ctx.moveTo(hoverX.current, pad.t);
      ctx.lineTo(hoverX.current, h - pad.b);
      ctx.stroke();
    }

    if (readoutRef.current) {
      const tstamp = new Date().toLocaleTimeString(localeRef.current, { hour12: false });
      readoutRef.current.textContent = `${tstamp}   ${readout.join("   ")}`;
    }
  }, []);

  useEffect(() => {
    const c = clock.current;
    if (reduce) {
      c.t = 60;
      draw();
      const id = setInterval(() => {
        c.t += 2;
        draw();
      }, 2000);
      return () => clearInterval(id);
    }
    if (!inView) {
      draw();
      return;
    }
    const loop = (ts: number) => {
      if (!c.last) c.last = ts;
      const dt = (ts - c.last) / 1000;
      c.last = ts;
      c.t += Math.min(dt, 0.1);
      draw();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      c.last = 0;
    };
  }, [inView, reduce, draw]);

  return (
    <div ref={wrapRef} className="bezel bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <ToggleGroup.Root
          type="multiple"
          value={active}
          onValueChange={(v) => v.length && setActive(v as ChannelId[])}
          aria-label={tl("channels")}
          className="flex flex-wrap gap-1 font-mono text-[12px]"
        >
          {channels.map((c) => (
            <ToggleGroup.Item
              key={c.id}
              value={c.id}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 press text-text-secondary transition-colors hover:text-text-primary data-[state=on]:border-text-primary data-[state=on]:text-text-primary"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: active.includes(c.id)
                    ? SERIES_COLORS[active.indexOf(c.id) % SERIES_COLORS.length]
                    : "var(--line-strong)",
                }}
              />
              {tl(`channelNames.${c.id}`)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          {WINDOW_SEC}s
        </span>
      </div>

      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="block h-40 w-full cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:h-48"
        role="img"
        aria-label={`${tl("chartAria", {
          sec: WINDOW_SEC,
          list: active.map((id) => tl(`channelNames.${id}`)).join(", "),
        })} ${tl("chartKeyboardHint")}`}
        onKeyDown={inspectByKey}
        onBlur={() => {
          hoverX.current = null;
          if (reduce || !inView) draw();
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch") return;
          const r = e.currentTarget.getBoundingClientRect();
          hoverX.current = e.clientX - r.left;
          if (reduce || !inView) draw();
        }}
        onPointerLeave={() => {
          hoverX.current = null;
          if (reduce || !inView) draw();
        }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          hoverX.current = e.clientX - r.left;
          if (reduce || !inView) draw();
        }}
      />

      <div
        ref={readoutRef}
        aria-live="off"
        className={cn("border-t border-line px-4 py-2 font-mono text-[11px] text-text-secondary")}
      />
      <div ref={liveRef} aria-live="polite" className="sr-only" />
      <p className="border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {tl("footerNote")}
      </p>
    </div>
  );
}
