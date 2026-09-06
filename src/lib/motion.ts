/**
 * Shared motion tokens. Mirrors the CSS custom properties in globals.css so
 * JS-driven animation and CSS transitions use the same timing. Do not invent a
 * new spring or curve per component.
 */
export const DUR = {
  instant: 0.1,
  fast: 0.16,
  base: 0.24,
  slow: 0.42,
  explain: 0.7,
} as const;

export const EASE = {
  /** general UI motion */
  standard: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  /** entrances and reveals */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

/** One spring for layout / selection movement. */
export const SPRING = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 };
