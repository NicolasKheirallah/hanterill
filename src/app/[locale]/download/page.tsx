import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { DownloadPanel } from "@/components/download/DownloadPanel";
import { getLatestRelease } from "@/lib/github";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/download", id: "download" });
}

async function Panel() {
  const release = await getLatestRelease();
  return <DownloadPanel release={release} />;
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.download");
  const td = await getTranslations("download");
  const tc = await getTranslations("common");
  return (
    <>
      <LocalizedPageHeader id="download" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Suspense
            fallback={
              <div role="status" className="h-72 rounded-sm border border-line bg-surface">
                <span className="sr-only">{tc("loading")}</span>
              </div>
            }
          >
            <Panel />
          </Suspense>

          <Prose>
            <h2>{t("hSource")}</h2>
            <p>{t("pSource")}</p>
            <h2>{t("hVerify")}</h2>
            <p>{t("pVerify")}</p>
            <h2>{t("hCadence")}</h2>
            <p>{t("pCadence")}</p>
          </Prose>
        </div>

        <div className="mt-8 flex flex-wrap gap-6">
          <MoreLink href="/changelog">{t("changelogLink")}</MoreLink>
          <MoreLink href="/docs/releases">{t("releasesDocsLink")}</MoreLink>
          <MoreLink href={site.releasesUrl} external>
            {t("allReleasesLink")}
          </MoreLink>
        </div>

        <div className="mt-2xl max-w-[36rem] border-t border-line-strong pt-6">
          <h2 className="font-[family-name:var(--font-display)] text-[1.375rem] text-text-primary">
            {td("licenseHeading")}
          </h2>
          <p className="mt-2 text-[15px] font-medium text-text-primary">{site.license.short}</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">{site.license.line}</p>
          <div className="mt-4">
            <MoreLink href="/docs/license">{td("readLicense")}</MoreLink>
          </div>
        </div>
      </Container>
    </>
  );
}
