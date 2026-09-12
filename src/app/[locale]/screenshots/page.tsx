import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { ScreenshotGallery, type ShotItem } from "@/components/screenshots/ScreenshotGallery";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/screenshots", id: "screenshots" });
}

// Files live in public/assets (kebab-case; no spaces so the paths resolve in
// `next dev` and the static export). Paths are repo-root asset paths without
// the Pages base path; the Shot component prefixes it. Full literal paths let
// the repo hygiene gate verify each file exists and is referenced.
// `labelKey` resolves against the `shots` namespace; `href` links the caption
// to the feature page that covers the screen.
const shotEntries: { root: string; labelKey: string; href?: string }[] = [
  { root: "/assets/overview.png", labelKey: "overview", href: "/features" },
  { root: "/assets/vehicle-info.png", labelKey: "vehicleInfo", href: "/features/vehicle-diagnostics" },
  { root: "/assets/vehicle-info-2.png", labelKey: "vehicleInfo", href: "/features/vehicle-diagnostics" },
  { root: "/assets/connections.png", labelKey: "connections", href: "/docs/connection" },
  { root: "/assets/battery-health.png", labelKey: "batteryHealth", href: "/features/battery-health" },
  { root: "/assets/battery-health-2.png", labelKey: "batteryHealth", href: "/features/battery-health" },
  { root: "/assets/cell-map.png", labelKey: "cellMap", href: "/features/battery-health" },
  { root: "/assets/12v-sleep-draw.png", labelKey: "sleepDraw", href: "/features/system-telemetry" },
  { root: "/assets/heat-pump.png", labelKey: "heatPump", href: "/features/system-telemetry" },
  { root: "/assets/tcam-gps.png", labelKey: "tcamGps", href: "/features/system-telemetry" },
  { root: "/assets/drive-units.png", labelKey: "driveUnits", href: "/features/system-telemetry" },
  { root: "/assets/fault-codes.png", labelKey: "faultCodes", href: "/features/vehicle-diagnostics" },
  { root: "/assets/fault-codes-2.png", labelKey: "faultCodes", href: "/features/vehicle-diagnostics" },
  { root: "/assets/service-routines.png", labelKey: "serviceRoutines", href: "/features/service-functions" },
  { root: "/assets/service-routines-2.png", labelKey: "serviceRoutines", href: "/features/service-functions" },
  { root: "/assets/ppi.png", labelKey: "inspection", href: "/features/inspection-reports" },
  { root: "/assets/ppi-2.png", labelKey: "inspection", href: "/features/inspection-reports" },
  { root: "/assets/ppi-3.png", labelKey: "inspection", href: "/features/inspection-reports" },
];

export default async function ScreenshotsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ts = await getTranslations("shots");
  const shots: ShotItem[] = shotEntries.map((s) => ({
    root: s.root,
    label: ts(s.labelKey),
    href: s.href,
  }));

  return (
    <>
      <LocalizedPageHeader id="screenshots" />
      <Container className="py-xl lg:py-2xl">
        <ScreenshotGallery shots={shots} />
      </Container>
    </>
  );
}
