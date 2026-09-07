import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { PlatformExplorer, StatusLegend } from "@/components/vehicles/PlatformExplorer";
import { Faq, type QA } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Supported vehicles",
  description:
    "Hanterill is CMA-first: Polestar 2 and the CMA Volvos are the tested platforms, with SPA, SEA and SPA2 support in progress. Platform compatibility is not verified support.",
};

export default async function VehiclesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tp, tf] = await Promise.all([getTranslations("platforms"), getTranslations("faq")]);
  const compatFaq = tf.raw("compat") as QA[];

  return (
    <>
      <LocalizedPageHeader id="vehicles" />

      <Container className="py-xl lg:py-2xl">
        <PlatformExplorer />

        <div className="mt-2xl grid items-start gap-10 border-t border-line pt-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-[1.375rem] text-text-primary">
              {tp("labelsHeading")}
            </h2>
            <div className="mt-4">
              <StatusLegend />
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-text-muted lg:pt-6">{tp("disclaimer")}</p>
        </div>
      </Container>

      <Faq items={compatFaq} title={tf("compatTitle")} />
    </>
  );
}
