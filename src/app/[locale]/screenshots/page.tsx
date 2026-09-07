import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { ScreenshotGallery, type Shot } from "@/components/screenshots/ScreenshotGallery";

export const metadata: Metadata = {
  title: "Screenshots",
  description:
    "The openCMA app on a supported Volvo and Polestar: overview, battery health, fault codes, live telemetry and service routines.",
};

// Files live in public/assets (kebab-case; no spaces so the paths resolve in
// `next dev`, the static export, and under a GitHub Pages basePath alike).
const shots: Shot[] = [
  { src: "/assets/overview.png", label: "Overview" },
  { src: "/assets/vehicle-info.png", label: "Vehicle info" },
  { src: "/assets/vehicle-info-2.png", label: "Vehicle info" },
  { src: "/assets/connections.png", label: "Connections" },
  { src: "/assets/battery-health.png", label: "Battery health" },
  { src: "/assets/battery-health-2.png", label: "Battery health" },
  { src: "/assets/cell-map.png", label: "Cell map" },
  { src: "/assets/12v-sleep-draw.png", label: "12 V sleep draw" },
  { src: "/assets/heat-pump.png", label: "Heat pump" },
  { src: "/assets/tcam-gps.png", label: "TCAM GPS" },
  { src: "/assets/drive-units.png", label: "Drive units" },
  { src: "/assets/fault-codes.png", label: "Fault codes" },
  { src: "/assets/fault-codes-2.png", label: "Fault codes" },
  { src: "/assets/service-routines.png", label: "Service routines" },
  { src: "/assets/service-routines-2.png", label: "Service routines" },
  { src: "/assets/ppi.png", label: "PPI" },
  { src: "/assets/ppi-2.png", label: "PPI" },
  { src: "/assets/ppi-3.png", label: "PPI" },
];

export default async function ScreenshotsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LocalizedPageHeader id="screenshots" />
      <Container className="py-xl lg:py-2xl">
        <ScreenshotGallery shots={shots} />
      </Container>
    </>
  );
}
