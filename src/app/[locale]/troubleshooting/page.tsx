import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Section, MoreLink, Figure } from "@/components/ui/layout";
import { Disclosure } from "@/components/ui/Disclosure";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { RecommendedAdapters } from "@/components/download/RecommendedAdapters";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/troubleshooting", id: "troubleshooting" });
}

/** The order they actually occur in, which is also the order to work down. */
const STEPS = ["ignition", "port", "firewall", "adapter", "exclusive"] as const;
const RECOVERY = ["route", "stale", "keepalive", "identity"] as const;

/**
 * Promoted from `/docs/connection`. The router table on the home page sent
 * "the car does not appear when I plug in" to "Connection troubleshooting",
 * and no route, page or anchor carried that name - the content existed, buried
 * two headings deep in a reference page. This is the destination.
 */
export default async function TroubleshootingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("troubleshooting");

  return (
    <>
      <LocalizedPageHeader id="troubleshooting" />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div>
            <h2 className="text-[length:var(--text-title)] leading-tight">{t("noCarTitle")}</h2>
            <p className="mt-3 max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
              {t("noCarLead")}
            </p>

            <ol className="mt-8 overflow-hidden rounded-sm border border-line">
              {STEPS.map((step, i) => (
                <li key={step} className="border-b border-line bg-surface last:border-0">
                  <div className="flex items-baseline gap-4 px-5 pt-4">
                    <span className="tnum font-mono text-[length:var(--text-micro)] tracking-[0.08em] text-text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[length:var(--text-body)] font-medium text-text-primary">
                      {t(`steps.${step}.check`)}
                    </h3>
                  </div>
                  <p className="max-w-[68ch] px-5 pb-4 pl-[3.4rem] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                    {t(`steps.${step}.detail`)}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-sm border border-line-strong bg-bg-secondary p-5">
              <StatusMarker tone="warning">{t("oneCableTitle")}</StatusMarker>
              <p className="mt-3 max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                {t("oneCableBody")}
              </p>
            </div>

            <h2 className="mt-2xl text-[length:var(--text-title)] leading-tight">{t("dropsTitle")}</h2>
            <p className="mt-3 max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
              {t("dropsLead")}
            </p>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {RECOVERY.map((k) => (
                <div key={k} className="grid gap-2 py-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
                  <dt className="font-mono text-[length:var(--text-meta)] text-text-primary">
                    {t(`recovery.${k}.label`)}
                  </dt>
                  <dd className="max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                    {t(`recovery.${k}.detail`)}
                  </dd>
                </div>
              ))}
            </dl>

            <Disclosure label={t("wirelessTitle")} className="mt-8">
              <p className="max-w-[68ch] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                {t("wirelessBody")}
              </p>
            </Disclosure>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Figure caption={t("figureCaption")}>
              <RecommendedAdapters />
            </Figure>
            <p className="mt-6 font-mono text-[length:var(--text-micro)] leading-relaxed text-text-muted">
              {t("stillStuck")}
            </p>
            <div className="mt-4 flex flex-col items-start gap-3">
              <MoreLink href="/docs/connection">{t("connectionGuide")}</MoreLink>
              <MoreLink href="/docs/supported-vehicles">{t("supportedVehicles")}</MoreLink>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
