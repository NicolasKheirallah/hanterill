"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";

export type Shot = { src: string; label: string };

const RATIO = 3456 / 2088;

export function ScreenshotGallery({ shots }: { shots: Shot[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const show = useCallback((i: number) => {
    restoreRef.current = document.activeElement as HTMLElement;
    setOpen(i);
  }, []);
  const close = useCallback(() => {
    setOpen(null);
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
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shots.map((s, i) => (
          <li key={s.src}>
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={`${s.label}, view larger`}
              className="press bezel group block w-full overflow-hidden bg-surface text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            >
              <span className="block overflow-hidden" style={{ aspectRatio: RATIO }}>
                <Image
                  src={s.src}
                  alt={s.label}
                  width={3456}
                  height={2088}
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </span>
              <span className="block border-t border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open != null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={shots[open].label}
            className="fixed inset-0 z-[80] flex flex-col bg-bg-primary/95 backdrop-blur-sm"
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast, ease: EASE.out }}
            onClick={close}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-secondary">
                {shots[open].label}
                <span className="ml-3 text-text-muted">
                  {open + 1} / {shots.length}
                </span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="press inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous screenshot"
                className="press absolute left-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong bg-bg-primary/80 text-text-secondary transition-colors hover:text-text-primary sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <motion.div
                key={shots[open].src}
                className="bezel max-h-full max-w-[min(1400px,100%)] overflow-hidden bg-surface"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DUR.base, ease: EASE.out }}
              >
                <Image
                  src={shots[open].src}
                  alt={shots[open].label}
                  width={3456}
                  height={2088}
                  sizes="min(1400px, 100vw)"
                  className="h-auto max-h-[calc(100vh-9rem)] w-auto object-contain"
                  priority
                />
              </motion.div>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next screenshot"
                className="press absolute right-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong bg-bg-primary/80 text-text-secondary transition-colors hover:text-text-primary sm:right-6"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
