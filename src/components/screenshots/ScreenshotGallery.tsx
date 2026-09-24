"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-motion-prefs";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DUR, EASE } from "@/lib/motion";
import { Shot } from "@/components/ui/Shot";
import { cn } from "@/lib/cn";

export type ShotItem = { root: string; label: string; href?: string };

const RATIO = "3456 / 2088";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** A flick has to beat this to advance more than one step. */
const FLICK_VX = 500;
/** ...or travel this far from where the drag started. */
const FLICK_DX = 80;
/**
 * Screenshot gallery with a lightbox.
 *
 * Two things were wrong with the interaction layer:
 *
 *  - The tiles are `<button>`s carrying `.bezel`, and a bezel clips its own box
 *    with `clip-path`. `outline-none` removed the fallback ring and the
 *    `focus-visible:ring` (a box-shadow) was drawn outside the clip polygon, so
 *    all 18 tiles had no visible focus indicator at all. `.bezel:focus-visible`
 *    in globals.css now draws the ring inside the clip; the redundant
 *    ring/outline utilities are gone.
 *  - Nothing was draggable. A lightbox on a phone could only be dismissed with
 *    the 40px ✕ button or Escape, neither of which exists on a touch device.
 *    It now tracks the pointer 1:1, hands the release velocity to the spring
 *    and projects momentum to decide whether a flick moves one step or throws
 *    the image away.
 */
export function ScreenshotGallery({
  shots,
  feature = false,
}: {
  shots: ShotItem[];
  /** One full-width tile: the home page's featured capture. */
  feature?: boolean;
}) {
  const t = useTranslations("gallery");
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState<number | null>(null);
  const [drag, setDrag] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const gesture = useRef<{ id: number; x: number; y: number; t: number; vx: number; active: boolean } | null>(
    null,
  );
  const [velocity, setVelocity] = useState(0);

  const show = useCallback((i: number) => {
    restoreRef.current = document.activeElement as HTMLElement;
    setOpen(i);
  }, []);
  const close = useCallback(() => {
    setOpen(null);
    setDrag(0);
    restoreRef.current?.focus?.();
  }, []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i == null ? i : (i + d + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (open == null) return;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        // Focus trap: cycle Tab through the dialog controls only. Only nodes
        // with tabIndex >= 0 can actually take focus.
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.tabIndex >= 0 && n.offsetParent !== null,
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, step]);

  /**
   * Momentum projection. Apple's deceleration form, not v^2/2a: where would
   * this flick come to rest if it kept decelerating? The step decision is made
   * from the projected endpoint, so a short fast flick advances and a slow
   * long drag does not.
   */
  const projected = useMemo(() => {
    const decel = 0.998;
    return drag + (velocity / 1000) * (decel / (1 - decel));
  }, [drag, velocity]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (reduce) return;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g?.active) return;
    const now = performance.now();
    const dt = Math.max(now - g.t, 1);
    // Track velocity across a short history window rather than the whole drag.
    g.vx = ((e.clientX - g.x) / dt) * 1000;
    g.t = now;
    setVelocity(g.vx);
    setDrag(e.clientX - g.x + (e.clientY - g.y) * 0.35);
  };

  const onPointerUp = () => {
    const g = gesture.current;
    if (!g) return;
    g.active = false;
    const vx = g.vx;
    gesture.current = null;
    setDrag(0);
    setVelocity(0);
    if (reduce) return;
    if (projected > FLICK_DX * 2 || vx > FLICK_VX) step(-1);
    else if (projected < -FLICK_DX * 2 || vx < -FLICK_VX) step(1);
  };

  return (
    <>
      <ul className={cn("grid gap-4", !feature && "sm:grid-cols-2 xl:grid-cols-3", feature && "max-w-[52rem]")}>
        {shots.map((s, i) => (
          <li key={`${s.root}-${i}`}>
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={`${s.label} · ${t("viewLarger")}`}
              className="press bezel group block w-full overflow-hidden bg-surface text-left"
            >
              <span className="block overflow-hidden bg-surface" style={{ aspectRatio: RATIO }}>
                <Shot
                  root={s.root}
                  alt={s.label}
                  width={3456}
                  height={2088}
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  imgClassName="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </span>
              <span className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                {s.label}
                <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                  <Maximize2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                  {t("viewLarger")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open != null ? (
          <motion.div
            ref={dialogRef as React.Ref<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-label={shots[open].label}
            data-material
            className="fixed inset-0 z-[80] flex flex-col bg-bg-primary/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast, ease: EASE.out }}
            onClick={close}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
              <span className="font-mono text-[length:var(--text-meta)] uppercase tracking-[length:var(--track-label)] text-text-secondary">
                {shots[open].href ? (
                  <Link href={shots[open].href} className="text-accent hover:text-accent-hover">
                    {shots[open].label}
                  </Link>
                ) : (
                  shots[open].label
                )}
                {shots.length > 1 ? (
                  <span className="ml-3 text-text-muted">
                    {open + 1} / {shots.length}
                  </span>
                ) : null}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={t("close")}
                className="press inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div
              className="relative flex flex-1 touch-pan-y items-center justify-center overflow-hidden p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {shots.length > 1 ? (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("previous")}
                  className="press absolute left-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong bg-bg-primary/80 text-text-secondary transition-colors hover:text-text-primary sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
                </button>
              ) : null}

              {/* Keyed on the index with a direction, so the exit mirrors the
                  entry. Both arrow buttons used to look identical and the
                  image was simply swapped with no motion at all. */}
              <motion.div
                key={shots[open].root}
                style={drag ? { x: drag, opacity: Math.max(0.35, 1 - Math.abs(drag) / 500) } : undefined}
                className="bezel max-h-full max-w-[min(1400px,100%)] overflow-hidden bg-surface"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reduce ? DUR.fast : DUR.base, ease: EASE.out }}
              >
                <Shot
                  root={shots[open].root}
                  alt={shots[open].label}
                  width={3456}
                  height={2088}
                  sizes="min(1400px, 100vw)"
                  imgClassName="pointer-events-none h-auto max-h-[calc(100vh-9rem)] w-auto object-contain"
                  priority
                />
              </motion.div>

              {shots.length > 1 ? (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("next")}
                  className="press absolute right-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong bg-bg-primary/80 text-text-secondary transition-colors hover:text-text-primary sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
