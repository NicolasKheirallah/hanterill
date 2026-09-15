import { Shot } from "@/components/ui/Shot";

/**
 * A single screenshot inside a doc page. Wraps `Shot` so MDX files never carry
 * the intrinsic pixel dimensions or the responsive sizes expression, and so a
 * caption is always rendered as a real `figcaption`.
 *
 * `root` is a repo-root asset path (`/assets/...`). The source list below is a
 * union type, not runtime data: the hygiene gate verifies every `/assets/`
 * path referenced from src exists in public/assets, so a typo fails the build
 * rather than producing a broken image.
 */
export type ScreenShotRoot =
  | "/assets/overview.png"
  | "/assets/vehicle-info.png"
  | "/assets/vehicle-info-2.png"
  | "/assets/connections.png"
  | "/assets/battery-health.png"
  | "/assets/battery-health-2.png"
  | "/assets/cell-map.png"
  | "/assets/12v-sleep-draw.png"
  | "/assets/heat-pump.png"
  | "/assets/tcam-gps.png"
  | "/assets/drive-units.png"
  | "/assets/fault-codes.png"
  | "/assets/fault-codes-2.png"
  | "/assets/service-routines.png"
  | "/assets/service-routines-2.png"
  | "/assets/ppi.png"
  | "/assets/ppi-2.png"
  | "/assets/ppi-3.png";

export function ScreenShot({
  root,
  alt,
  caption,
}: {
  root: ScreenShotRoot;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-6">
      <div className="bezel overflow-hidden bg-surface">
        <Shot
          root={root}
          alt={alt}
          width={3456}
          height={2088}
          sizes="(min-width: 1024px) 42rem, 100vw"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 font-mono text-[12px] text-text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
