import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { ScreenshotGallery, type Shot } from "@/components/screenshots/ScreenshotGallery";

export const metadata: Metadata = {
  title: "Screenshots",
  description:
    "The Hanterill app on a supported Volvo and Polestar: overview, battery health, fault codes, live telemetry and service routines.",
};

// Files live in public/assets (kebab-case; no spaces so the paths resolve in
// `next dev` and the static export). `next/image` with `unoptimized` does not
// prepend `basePath` to a plain string src, so the GitHub Pages project path
// has to be added here by hand (empty for a user site / custom domain).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (name: string) => `${BASE}/assets/${name}`;

const shots: Shot[] = [
  { src: asset("overview.png"), label: "Overview" },
  { src: asset("vehicle-info.png"), label: "Vehicle info" },
  { src: asset("vehicle-info-2.png"), label: "Vehicle info" },
  { src: asset("connections.png"), label: "Connections" },
  { src: asset("battery-health.png"), label: "Battery health" },
  { src: asset("battery-health-2.png"), label: "Battery health" },
  { src: asset("cell-map.png"), label: "Cell map" },
  { src: asset("12v-sleep-draw.png"), label: "12 V sleep draw" },
  { src: asset("heat-pump.png"), label: "Heat pump" },
  { src: asset("tcam-gps.png"), label: "TCAM GPS" },
  { src: asset("drive-units.png"), label: "Drive units" },
  { src: asset("fault-codes.png"), label: "Fault codes" },
  { src: asset("fault-codes-2.png"), label: "Fault codes" },
  { src: asset("service-routines.png"), label: "Service routines" },
  { src: asset("service-routines-2.png"), label: "Service routines" },
  { src: asset("ppi.png"), label: "PPI" },
  { src: asset("ppi-2.png"), label: "PPI" },
  { src: asset("ppi-3.png"), label: "PPI" },
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
