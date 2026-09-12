import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/privacy", id: "privacy" });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.privacy");
  return (
    <>
      <LocalizedPageHeader id="privacy" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>{t("hStays")}</h2>
          <ul>
            {(t.raw("stays") as string[]).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2>{t("hNever")}</h2>
          <ul>
            {(t.raw("never") as string[]).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h2>{t("hVin")}</h2>
          <p>{t("pVin")}</p>

          <h2>{t("hNetwork")}</h2>
          <p>{t("pNetwork")}</p>

          <h2>{t("hNoSub")}</h2>
          <p>{t("pNoSub")}</p>
        </Prose>
      </Container>
    </>
  );
}
