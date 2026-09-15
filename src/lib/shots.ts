/**
 * The one map of application captures to the pages that explain them.
 *
 * It used to live inline in `/screenshots` only, which is why the seven feature
 * pages were text-only while eighteen real captures sat unused in
 * `public/assets`. Both consumers read this now: the gallery renders every
 * entry, and each feature page renders the ones whose `href` is its own route.
 *
 * `labelKey` resolves against the `shots` namespace. `detailKey` is the longer
 * caption used when the capture is the figure on a feature page - two entries
 * can share a `labelKey` (they are different screens of the same thing) but a
 * feature page only ever shows one of each pair, so the captions there stay
 * distinct.
 */
export type ShotEntry = {
  root: string;
  labelKey: string;
  detailKey: string;
  href: string;
};

// Paths are repo-root asset paths without the Pages base path; the Shot
// component prefixes it. Full literal paths let the repo hygiene gate verify
// each file exists and is referenced.
export const shots: ShotEntry[] = [
  {
    root: "/assets/overview.png",
    labelKey: "overview",
    detailKey: "overviewDetail",
    href: "/features/vehicle-diagnostics",
  },
  {
    root: "/assets/vehicle-info.png",
    labelKey: "vehicleInfo",
    detailKey: "vehicleInfoDetail",
    href: "/features/vehicle-diagnostics",
  },
  {
    root: "/assets/fault-codes.png",
    labelKey: "faultCodes",
    detailKey: "faultCodesDetail",
    href: "/features/vehicle-diagnostics",
  },
  {
    root: "/assets/battery-health.png",
    labelKey: "batteryHealth",
    detailKey: "batteryHealthDetail",
    href: "/features/battery-health",
  },
  {
    root: "/assets/cell-map.png",
    labelKey: "cellMap",
    detailKey: "cellMapDetail",
    href: "/features/battery-health",
  },
  {
    root: "/assets/connections.png",
    labelKey: "connections",
    detailKey: "connectionsDetail",
    href: "/features/live-data",
  },
  {
    root: "/assets/drive-units.png",
    labelKey: "driveUnits",
    detailKey: "driveUnitsDetail",
    href: "/features/live-data",
  },
  {
    root: "/assets/heat-pump.png",
    labelKey: "heatPump",
    detailKey: "heatPumpDetail",
    href: "/features/system-telemetry",
  },
  {
    root: "/assets/12v-sleep-draw.png",
    labelKey: "sleepDraw",
    detailKey: "sleepDrawDetail",
    href: "/features/system-telemetry",
  },
  {
    root: "/assets/service-routines.png",
    labelKey: "serviceRoutines",
    detailKey: "serviceRoutinesDetail",
    href: "/features/service-functions",
  },
  {
    root: "/assets/ppi.png",
    labelKey: "inspection",
    detailKey: "inspectionDetail",
    href: "/features/inspection-reports",
  },
  {
    root: "/assets/ppi-2.png",
    labelKey: "inspectionTabs",
    detailKey: "inspectionTabsDetail",
    href: "/features/inspection-reports",
  },
];

/** Extra gallery-only captures: second and third screens of the same view. */
export const galleryExtras: ShotEntry[] = [
  {
    root: "/assets/vehicle-info-2.png",
    labelKey: "vehicleInfoModules",
    detailKey: "vehicleInfoModulesDetail",
    href: "/features/vehicle-diagnostics",
  },
  {
    root: "/assets/fault-codes-2.png",
    labelKey: "faultCodesDetail2",
    detailKey: "faultCodesDetail2Detail",
    href: "/features/vehicle-diagnostics",
  },
  {
    root: "/assets/battery-health-2.png",
    labelKey: "batteryHealthModules",
    detailKey: "batteryHealthModulesDetail",
    href: "/features/battery-health",
  },
  {
    root: "/assets/tcam-gps.png",
    labelKey: "tcamGps",
    detailKey: "tcamGpsDetail",
    href: "/features/system-telemetry",
  },
  {
    root: "/assets/service-routines-2.png",
    labelKey: "serviceRoutinesLive",
    detailKey: "serviceRoutinesLiveDetail",
    href: "/features/service-functions",
  },
  {
    root: "/assets/ppi-3.png",
    labelKey: "inspectionEvidence",
    detailKey: "inspectionEvidenceDetail",
    href: "/features/inspection-reports",
  },
];

/** Every capture, in gallery order. */
export const allShots: ShotEntry[] = [...shots, ...galleryExtras];

/** Captures belonging to one feature route, for that page's figures. */
export function shotsFor(href: string): ShotEntry[] {
  return shots.filter((s) => s.href === href);
}
