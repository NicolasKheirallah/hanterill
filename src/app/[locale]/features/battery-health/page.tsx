import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { BatteryHealthPanel } from "@/components/battery/BatteryHealthPanel";
import { BatteryPackView } from "@/components/battery/BatteryPackView";
import { ModuleSelectionProvider } from "@/components/battery/selection-context";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/battery-health", id: "batteryHealth" });
}

export default async function BatteryHealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.batteryHealth");
  return (
    <ModuleSelectionProvider>
      <LocalizedPageHeader id="batteryHealth" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <BatteryHealthPanel />
          <Prose>
            <h2>{t("hWhere")}</h2>
            <p>{t("pWhere")}</p>
            <h2>{t("hWhat")}</h2>
            <ul>
              {(t.raw("reads") as string[]).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h2>{t("hTopologies")}</h2>
            <p>{t("pTopologies")}</p>
            <p>
              {t.rich("pEngineering", {
                strong: (chunks) => <strong>{chunks}</strong>,
                docs: (chunks) => <Link href="/docs/battery-diagnostics">{chunks}</Link>,
              })}
            </p>
          </Prose>
        </div>

        <div className="mt-12">
          <BatteryPackView />
        </div>

        <div className="mt-8">
          <MoreLink href="/docs/battery-diagnostics">{t("moreSoh")}</MoreLink>
        </div>
      </Container>

      <BatteryMatrixSection />
    </ModuleSelectionProvider>
  );
}
