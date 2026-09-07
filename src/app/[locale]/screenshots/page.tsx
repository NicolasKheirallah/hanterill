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

// Files live in public/assets. Spaces are pre-encoded so the paths are valid in
// an <img src> under the static export.
const shots: Shot[] = [
  { src: "/assets/Overwiew.png", label: "Overview" },
  { src: "/assets/Veichle%20Info.png", label: "Vehicle info" },
  { src: "/assets/Veichle%20Info%202.png", label: "Vehicle info" },
  { src: "/assets/Connections.png", label: "Connections" },
  { src: "/assets/Battery%20Health.png", label: "Battery health" },
  { src: "/assets/Battery%20Health%202.png", label: "Battery health" },
  { src: "/assets/Cell%20Map.png", label: "Cell map" },
  { src: "/assets/12V%20Draw%20Sleep.png", label: "12 V sleep draw" },
  { src: "/assets/Heatpump.png", label: "Heat pump" },
  { src: "/assets/TCAM%20GPS.png", label: "TCAM GPS" },
  { src: "/assets/Drive%20Units.png", label: "Drive units" },
  { src: "/assets/Fault%20codes.png", label: "Fault codes" },
  { src: "/assets/Fault%20codes%202.png", label: "Fault codes" },
  { src: "/assets/Service%20Routines.png", label: "Service routines" },
  { src: "/assets/Service%20Routines%202.png", label: "Service routines" },
  { src: "/assets/PPI.png", label: "PPI" },
  { src: "/assets/PPI%202.png", label: "PPI" },
  { src: "/assets/PPI%203.png", label: "PPI" },
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
