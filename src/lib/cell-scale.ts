/**
 * The one cell-deviation colour scale.
 *
 * There used to be three, and they disagreed. `BatteryMatrixSection` painted
 * a mid deviation amber, `BatteryReadout` painted it bronze, and `views.tsx`
 * painted it bronze too - so a user who learned the legend on the home page
 * misread the same word, on the same data, on the features page. Amber meant
 * "over tolerance" in one place and "mid" in another.
 *
 * Two more rules are baked in here:
 *
 *  - **The accent is not a data colour.** Bronze is the instrument backlight;
 *    it marks interactive state (selection, focus, the primary CTA). Using it
 *    as a heat value breaks the accent ledger in design.md and makes a
 *    "selected" cell and a "2-4 mV off" cell look identical.
 *  - **The neutral band is `--cell-neutral`, not `--line-strong`.** On the
 *    light surface `--line-strong` sits at ~1.2:1, so the baseline state of
 *    all 108 cells disappeared in light mode and only the outliers read.
 *
 * Every consumer must use these. If a fourth one appears, this module is the
 * thing to change.
 */

/** |offset| <= NEUTRAL_MV: within tolerance, no heat. */
export const NEUTRAL_MV = 2;
/** NEUTRAL_MV < |offset| <= WARN_MV: drifting. */
export const WARN_MV = 4;

/** Neutral: the cell is inside tolerance. */
export const CELL_NEUTRAL = "var(--cell-neutral)";
/** Drifting: worth a look, not a fault. */
export const CELL_WARN = "color-mix(in srgb, var(--status-warning) 55%, var(--line))";
/** Out of tolerance. */
export const CELL_OVER = "color-mix(in srgb, var(--status-error) 55%, var(--line))";

/** Sample-data legend, in the same order as the three constants above. */
export function cellFill(millivolts: number): string {
  const a = Math.abs(millivolts);
  if (a <= NEUTRAL_MV) return CELL_NEUTRAL;
  if (a <= WARN_MV) return CELL_WARN;
  return CELL_OVER;
}

/** Legend entries, so every surface renders the same three swatches. */
export const CELL_LEGEND = [
  { key: "within", fill: CELL_NEUTRAL },
  { key: "warning", fill: CELL_WARN },
  { key: "over", fill: CELL_OVER },
] as const;
