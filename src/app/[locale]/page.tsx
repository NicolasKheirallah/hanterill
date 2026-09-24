import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { ConnectionDiagram } from "@/components/architecture/ConnectionDiagram";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { VehicleCompatibility } from "@/components/vehicles/VehicleCompatibility";
import { DownloadSection } from "@/components/download/DownloadSection";
import { SafetySection } from "@/components/sections/SafetySection";
import { Faq, type QA } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { HomeMore } from "@/components/sections/HomeMore";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "", id: "home", absoluteTitle: true });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tf = await getTranslations("faq");
  const faqItems = tf.raw("home") as QA[];

  return (
    <>
      <Hero />
      <ConnectionDiagram />
      <BatteryMatrixSection />
      {/* The decision path: what it reads (the matrix above), whether it reads
          your car, then the download. The full feature walkthrough, the
          interactive session and the seven-step case study live on their own
          pages, linked from HomeMore. */}
      <VehicleCompatibility />
      <DownloadSection />
      <HomeMore />
      <PrivacySection />
      <SafetySection />
      <Faq items={faqItems} title={tf("title")} />
      <ClosingCta />
    </>
  );
}
