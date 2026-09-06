"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import {
  channelById,
  channels,
  defaultChannels,
  sample,
  type ChannelId,
} from "@/lib/telemetry-sim";
import { cn } from "@/lib/cn";

const WINDOWS = [15, 30, 60] as const;
const SERIES_VARS = ["--accent", "--status-info", "--status-warning"] as const;
/** Fallbacks; the real values are read from CSS at draw time (canvas cannot resolve var()). */
const SERIES_COLORS = ["#3557e0", "#4e72a2", "#855a1b"];

/**
 * Continuously moving telemetry. The render loop runs on requestAnimationFrame
 * and writes straight to a canvas, so React never re-renders per frame. The
 * loop pauses when the section is off screen, when the tab is hidden, when the
 * user pauses, and under reduced motion (which shows a static window with a
 * slow periodic tick instead).
 */
export function LiveTelemetryChart() {
  const t = useTranslations("telemetry");
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.3 });

  const label = useCallback((id: ChannelId) => t(`channelNames.${id}`), [t]);
  const labelRef = useRef(label);
  useEffect(() => {
    labelRef.current = label;
  }, [label]);

  const [active, setActive] = useState<ChannelId[]>(defaultChannels);
  const [windowSec, setWindowSec] = useState<(typeof WINDOWS)[number]>(30);
  const [paused, setPaused] = useState(false);

  const clock = useRef({ t: 0, last: 0 });
  const raf = useRef<number | null>(null);
  const hoverX = useRef<number | null>(null);
  const activeRef = useRef(active);
  const windowRef = useRef(windowSec);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    windowRef.current = windowSec;
  }, [windowSec]);

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

    const cs = getComputedStyle(document.documentElement);
    const line = cs.getPropertyValue("--line").trim() || "#d8d8d4";
    const lineStrong = cs.getPropertyValue("--line-strong").trim() || "#babab5";
    const seriesColor = (i: number) =>
      cs.getPropertyValue(SERIES_VARS[i % SERIES_VARS.length]).trim() ||
      SERIES_COLORS[i % SERIES_COLORS.length];
    const now = clock.current.t;
    const win = windowRef.current;
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
        `${labelRef.current(id)}  ${sample(id, readT).toFixed(ch.decimals)} ${ch.unit}`,
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
      const tstamp = new Date(Date.now()).toLocaleTimeString("en-GB");
      readoutRef.current.textContent = `${tstamp}  ·  ${readout.join("   ")}`;
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
    if (paused || !inView) {
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
  }, [paused, inView, reduce, draw]);

  // Pausing on tab-hide is a courtesy; the loop also stops when off screen.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div ref={wrapRef} className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <ToggleGroup.Root
          type="multiple"
          value={active}
          onValueChange={(v) => v.length && setActive(v as ChannelId[])}
          aria-label={t("channels")}
          className="flex flex-wrap gap-1 font-mono text-[12px]"
        >
          {channels.map((c) => (
            <ToggleGroup.Item
              key={c.id}
              value={c.id}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-text-secondary transition-colors hover:text-text-primary data-[state=on]:border-text-primary data-[state=on]:text-text-primary"
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
              {t(`channelNames.${c.id}`)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <div className="flex items-center gap-1 font-mono text-[12px]">
          <button
            type="button"
            aria-label={paused ? t("resumeAria") : t("pauseAria")}
            onClick={() => setPaused((p) => !p)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line px-2.5 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            {paused ? <Play className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />}
            {paused ? t("resume") : t("live")}
          </button>
          <ToggleGroup.Root
            type="single"
            value={String(windowSec)}
            onValueChange={(v) => v && setWindowSec(Number(v) as (typeof WINDOWS)[number])}
            aria-label={t("window")}
            className="flex rounded-sm border border-line"
          >
            {WINDOWS.map((s) => (
              <ToggleGroup.Item
                key={s}
                value={String(s)}
                className="px-2 py-1.5 text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
              >
                {s}s
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="block h-40 w-full cursor-crosshair sm:h-48"
        role="img"
        aria-label={t("chartAria", {
          sec: windowSec,
          list: active.map((id) => t(`channelNames.${id}`)).join(", "),
        })}
        onPointerMove={(e) => {
          if (e.pointerType === "touch") return;
          const r = e.currentTarget.getBoundingClientRect();
          hoverX.current = e.clientX - r.left;
          if (paused || reduce || !inView) draw();
        }}
        onPointerLeave={() => {
          hoverX.current = null;
          if (paused || reduce || !inView) draw();
        }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          hoverX.current = e.clientX - r.left;
          setPaused(true);
        }}
      />

      <div
        ref={readoutRef}
        aria-live="off"
        className={cn("border-t border-line px-4 py-2 font-mono text-[11px] text-text-secondary")}
      />
      <p className="border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {t("footerNote")}
      </p>
    </div>
  );
}
