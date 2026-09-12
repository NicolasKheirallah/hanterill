import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { SafetySection } from "@/components/sections/SafetySection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/safety", id: "safety" });
}

export default async function SafetyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.safety");
  return (
    <>
      <LocalizedPageHeader id="safety" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>{t("hReadOnly")}</h2>
          <p>{t("pReadOnly")}</p>

          <h2>{t("hChanges")}</h2>
          <p>{t("pChanges")}</p>

          <h2>{t("hHv")}</h2>
          <p>{t("pHv")}</p>

          <h2>{t("hNoSubstitute")}</h2>
          <p>{t("pNoSubstitute")}</p>

          <h2>{t("hUnverified")}</h2>
          <p>{t("pUnverified")}</p>
        </Prose>
      </Container>

      <SafetySection />
    </>
  );
}
