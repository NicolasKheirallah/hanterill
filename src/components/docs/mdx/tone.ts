/**
 * Status tone -> class mapping for the docs MDX components. Mirrors the tone
 * vocabulary in src/lib/vehicles.ts (ok / warning / info / muted) and adds
 * `error` for safety. Colour is a reinforcement here, never the only signal:
 * every component that uses a tone also prints a word.
 */
export type Tone = "ok" | "warning" | "error" | "info" | "muted";

export const toneRing: Record<Tone, string> = {
  ok: "border-status-ok/40 bg-status-ok/8",
  warning: "border-status-warning/40 bg-status-warning/8",
  error: "border-status-error/40 bg-status-error/8",
  info: "border-status-info/40 bg-status-info/8",
  muted: "border-line-strong bg-bg-secondary",
};

export const toneText: Record<Tone, string> = {
  ok: "text-status-ok",
  warning: "text-status-warning",
  error: "text-status-error",
  info: "text-status-info",
  muted: "text-text-muted",
};
