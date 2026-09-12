import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { ScanSimulator } from "@/components/features/ScanSimulator";
import { EcuTopology } from "@/components/architecture/EcuTopology";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/vehicle-diagnostics", id: "vehicleDiagnostics" });
}

export default async function VehicleDiagnosticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.vehicleDiagnostics");
  return (
    <>
      <LocalizedPageHeader id="vehicleDiagnostics" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Prose>
            <h2>{t("hDiscovery")}</h2>
            <p>{t("pDiscovery")}</p>
            <h2>{t("hFaults")}</h2>
            <p>{t("pFaults")}</p>
            <h2>{t("hClearing")}</h2>
            <p>{t("pClearing")}</p>
            <h2>{t("hDid")}</h2>
            <p>{t("pDid")}</p>
            <h2>{t("hInventory")}</h2>
            <p>{t("pInventory")}</p>
            <h2>{t("hEvidence")}</h2>
            <p>
              {t.rich("pEvidence", {
                link: (chunks) => <Link href="/features/sessions-and-evidence">{chunks}</Link>,
              })}
            </p>
          </Prose>
          <div>
            <ScanSimulator />
            <div className="mt-4">
              <MoreLink href="/docs/dtc-scanning">{t("dtcDocs")}</MoreLink>
            </div>
          </div>
        </div>
      </Container>

      <EcuTopology />
    </>
  );
}
