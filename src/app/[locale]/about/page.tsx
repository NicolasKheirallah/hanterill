import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/about", id: "about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.about");
  return (
    <>
      <LocalizedPageHeader id="about" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>{t("hIndependence")}</h2>
          <p>{t("pIndependence")}</p>

          <h2>{t("hLicense")}</h2>
          <p>
            {t.rich("pLicense", {
              link: (chunks) => <Link href="/docs/license">{chunks}</Link>,
            })}
          </p>

          <h2>{t("hWhy")}</h2>
          <p>{t("pWhy")}</p>

          <h2>{t("hHow")}</h2>
          <p>{t("pHow")}</p>

          <h2>{t("hContrib")}</h2>
          <p>{t("pContrib")}</p>
        </Prose>

        <div className="mt-8 flex flex-wrap gap-6">
          <MoreLink href={site.repoUrl} external>
            {t("moreRepo")}
          </MoreLink>
          <MoreLink href="/docs/architecture">{t("moreArch")}</MoreLink>
        </div>
      </Container>
    </>
  );
}
