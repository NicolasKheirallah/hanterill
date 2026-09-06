"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useInView, useReducedMotion } from "motion/react";
import { Box } from "lucide-react";

type Mode = "deviation" | "temperature";

const BatteryPack3D = dynamic(
  () => import("./BatteryPack3D").then((m) => m.BatteryPack3D),
  { ssr: false, loading: () => <Placeholder label="Loading 3D view…" /> },
);

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribe = () => () => {};

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-72 w-full items-center justify-center rounded-lg border border-line bg-surface font-mono text-[12px] text-text-muted sm:h-80">
      {label}
    </div>
  );
}

/**
 * Optional 3D battery-pack view. Lazy-loaded, WebGL only, and it does not render
 * until it scrolls into view. Falls back to a note (the 2D matrix below carries
 * the same data) when WebGL is unavailable or reduced motion is set.
 */
export function BatteryPackView() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  // null on the server and the first client paint, then the real capability.
  const webgl = useSyncExternalStore<boolean | null>(subscribe, hasWebGL, () => null);
  const [mode, setMode] = useState<Mode>("deviation");

  return (
    <div ref={ref}>
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <Box className="h-3.5 w-3.5" strokeWidth={1.75} />
          Pack, 27 modules
        </span>
        <ToggleGroup.Root
          type="single"
          value={mode}
          onValueChange={(v) => v && setMode(v as Mode)}
          aria-label="3D colour mode"
          className="inline-flex rounded-sm border border-line-strong bg-surface p-0.5 font-mono text-[11px]"
        >
          {(["deviation", "temperature"] as Mode[]).map((m) => (
            <ToggleGroup.Item
              key={m}
              value={m}
              className="rounded-[2px] px-2 py-1 capitalize text-text-secondary transition-colors hover:text-text-primary data-[state=on]:bg-text-primary data-[state=on]:text-bg-primary"
            >
              {m}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      {webgl === null ? (
        <Placeholder label="Checking device…" />
      ) : !webgl || reduce ? (
        <div className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-lg border border-line bg-surface text-center font-mono text-[12px] text-text-muted sm:h-48">
          <span>Interactive 3D view unavailable here.</span>
          <span className="text-[11px]">The 2D potential matrix below has the same data.</span>
        </div>
      ) : inView ? (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <BatteryPack3D mode={mode} />
        </div>
      ) : (
        <Placeholder label="" />
      )}
    </div>
  );
}
