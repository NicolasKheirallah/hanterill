import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features", id: "features" });
}

const hubEntries = [
  { key: "battery", href: "/features/battery-health" },
  { key: "diagnostics", href: "/features/vehicle-diagnostics" },
  { key: "live", href: "/features/live-data" },
  { key: "systems", href: "/features/system-telemetry" },
  { key: "reports", href: "/features/inspection-reports" },
  { key: "sessions", href: "/features/sessions-and-evidence" },
  { key: "service", href: "/features/service-functions" },
] as const;

export default async function FeaturesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("features.hub");
  return (
    <>
      <LocalizedPageHeader id="features" />
      <Container className="py-xl lg:py-2xl">
        <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {hubEntries.map((f) => (
            <li key={f.href} className="bg-surface">
              <Link href={f.href} className="group flex h-full flex-col p-6 transition-colors hover:bg-bg-secondary">
                <h2 className="flex items-center justify-between text-xl font-medium tracking-tight text-text-primary">
                  {t(`${f.key}.title`)}
                  <ArrowRight
                    className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{t(`${f.key}.body`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
