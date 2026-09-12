import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { LiveTelemetryChart } from "@/components/telemetry/LiveTelemetryChart";
import { liveChannels } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/live-data", id: "liveData" });
}

export default async function LiveDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.liveData");
  const tc = await getTranslations("telemetry.channelNames");
  return (
    <>
      <LocalizedPageHeader id="liveData" />

      <Container className="py-xl lg:py-2xl">
        <LiveTelemetryChart />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Prose>
            <h2>{t("hChannels")}</h2>
            <p>{t("pChannels")}</p>
            <h2>{t("hReading")}</h2>
            <p>
              {t.rich("pReading", { strong: (chunks) => <strong>{chunks}</strong> })}
            </p>
            <h2>{t("hExport")}</h2>
            <p>{t("pExport")}</p>
          </Prose>
          <ul className="divide-y divide-line border-y border-line">
            {liveChannels.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between py-3">
                <span className="text-[14px] text-text-secondary">{tc(c.id)}</span>
                <span className="tnum font-mono text-[13px] text-text-primary">
                  {c.value} {c.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <MoreLink href="/docs/architecture">{t("archDocs")}</MoreLink>
        </div>
      </Container>
    </>
  );
}
