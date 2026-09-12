import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/system-telemetry", id: "systemTelemetry" });
}

export default async function SystemTelemetryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.systemTelemetry");
  const pages = t.raw("pages") as string[][];
  return (
    <>
      <LocalizedPageHeader id="systemTelemetry" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Prose>
            <h2>{t("hMeasured")}</h2>
            <p>{t("pMeasured")}</p>
            <h2>{t("hChecks")}</h2>
            <p>{t("pChecks")}</p>
            <h2>{t("hBoundaries")}</h2>
            <p>{t("pBoundaries")}</p>
            <div className="mt-6">
              <MoreLink href="/docs/battery-diagnostics">{t("thermalDocs")}</MoreLink>
            </div>
          </Prose>
          <ul className="divide-y divide-line border-y border-line">
            {pages.map(([name, desc]) => (
              <li key={name} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] font-medium text-text-primary">{name}</span>
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
