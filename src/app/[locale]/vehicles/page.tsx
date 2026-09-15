import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { PlatformExplorer, StatusLegend } from "@/components/vehicles/PlatformExplorer";
import { ServiceModes } from "@/components/vehicles/ServiceModes";
import { Faq, type QA } from "@/components/sections/Faq";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/vehicles", id: "vehicles" });
}

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

        <div className="mt-2xl border-t border-line-strong pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-[1.375rem] text-text-primary">
            {tp("serviceModesHeading")}
          </h2>
          <p className="mt-3 max-w-[64ch] text-[14px] leading-relaxed text-text-secondary">
            {tp("serviceModesLead")}
          </p>
          <div className="mt-6">
            <ServiceModes />
          </div>
          <p className="mt-4 max-w-[64ch] text-[13px] leading-relaxed text-text-muted">
            {tp("serviceModesNote")}
          </p>
          <div className="mt-4">
            <MoreLink href="/safety">{tp("serviceModesSafety")}</MoreLink>
          </div>
        </div>

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
