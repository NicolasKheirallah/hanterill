import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { ConnectionDiagram } from "@/components/architecture/ConnectionDiagram";
import { FeatureBlocks } from "@/components/features/FeatureBlocks";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { ProtocolStack } from "@/components/architecture/ProtocolStack";
import { EcuTopology } from "@/components/architecture/EcuTopology";
import { SessionSimulator } from "@/components/product/SessionSimulator";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { OpenSourceSection } from "@/components/opensource/OpenSourceSection";
import { VehicleCompatibility } from "@/components/vehicles/VehicleCompatibility";
import { HardwareChain } from "@/components/sections/HardwareChain";
import { DownloadSection } from "@/components/download/DownloadSection";
import { SafetySection } from "@/components/sections/SafetySection";
import { Faq, type QA } from "@/components/sections/Faq";
import { ClosingCta } from "@/components/sections/ClosingCta";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tf = await getTranslations("faq");
  const faqItems = tf.raw("home") as QA[];

  return (
    <>
      <Hero />
      <ConnectionDiagram />
      <FeatureBlocks />
      <BatteryMatrixSection />
      <ProtocolStack />
      <EcuTopology />
      <SessionSimulator />
      <PrivacySection />
      <OpenSourceSection />
      <VehicleCompatibility />
      <HardwareChain />
      <DownloadSection />
      <SafetySection />
      <Faq items={faqItems} title={tf("title")} />
      <ClosingCta />
    </>
  );
}
