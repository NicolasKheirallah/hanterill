import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { ConnectionDiagram } from "@/components/architecture/ConnectionDiagram";
import { FeatureBlocks } from "@/components/features/FeatureBlocks";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { ProtocolStack } from "@/components/architecture/ProtocolStack";
import { EcuTopology } from "@/components/architecture/EcuTopology";
import { SessionSimulator } from "@/components/product/SessionSimulator";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { VehicleCompatibility } from "@/components/vehicles/VehicleCompatibility";
import { HardwareChain } from "@/components/sections/HardwareChain";
import { DownloadSection } from "@/components/download/DownloadSection";
import { SafetySection } from "@/components/sections/SafetySection";
import { Faq, type QA } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";
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
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <ConnectionDiagram />
      <FeatureBlocks />
      <BatteryMatrixSection />
      <ProtocolStack />
      <EcuTopology />
      <SessionSimulator />
      <PrivacySection />
      <VehicleCompatibility />
      <HardwareChain />
      <DownloadSection />
      <SafetySection />
      <Faq items={faqItems} title={tf("title")} />
      <ClosingCta />
    </>
  );
}
