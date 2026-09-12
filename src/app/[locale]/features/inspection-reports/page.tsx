import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/inspection-reports", id: "inspectionReports" });
}

export default async function InspectionReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.inspectionReports");
  const domains = t.raw("domains") as string[][];
  return (
    <>
      <LocalizedPageHeader id="inspectionReports" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Prose>
            <h2>{t("hRules")}</h2>
            <p>{t("pRules")}</p>
            <h2>{t("hMissing")}</h2>
            <p>{t("pMissing")}</p>
            <h2>{t("hReport")}</h2>
            <p>{t("pReport")}</p>
            <h2>{t("hBuying")}</h2>
            <p>
              {t.rich("pBuying", {
                link: (chunks) => <Link href="/docs/inspection-reports">{chunks}</Link>,
              })}
            </p>
          </Prose>
          <div>
            <div className="border border-line bg-surface">
              <div className="border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {t("scoredDomains")}
              </div>
              <ul className="divide-y divide-line">
                {domains.map(([name, desc]) => (
                  <li key={name} className="px-5 py-3">
                    <div className="text-[14px] text-text-primary">{name}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{desc}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <MoreLink href="/features/sessions-and-evidence">{t("sessionsLink")}</MoreLink>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
