import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/service-functions", id: "serviceFunctions" });
}

export default async function ServiceFunctionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.serviceFunctions");
  const routines = t.raw("routines") as string[][];
  return (
    <>
      <LocalizedPageHeader id="serviceFunctions" />

      <Container className="py-xl lg:py-2xl">
        <div className="mb-10 flex items-start gap-3 border-l-2 border-status-warning py-1 pl-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" strokeWidth={1.75} />
          <p className="text-[14px] leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">{t("warningLead")}</span>{" "}
            {t("warningBody")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse border-t border-line-strong text-[14px]">
            <caption className="sr-only">{t("hAvail")}</caption>
            <thead>
              <tr>
                <th className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
                  {t("thSystem")}
                </th>
                <th className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
                  {t("thRoutine")}
                </th>
                <th className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
                  {t("thService")}
                </th>
              </tr>
            </thead>
            <tbody>
              {routines.map(([sys, desc, svc]) => (
                <tr key={sys}>
                  <td className="border-b border-line px-3 py-2.5 text-text-primary">{sys}</td>
                  <td className="border-b border-line px-3 py-2.5 text-text-secondary">{desc}</td>
                  <td className="border-b border-line px-3 py-2.5 font-mono text-[12px] text-text-muted">
                    {svc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Prose className="mt-10">
          <h2>{t("hClearing")}</h2>
          <p>
            {t.rich("pClearing", {
              link: (chunks) => <Link href="/features/sessions-and-evidence">{chunks}</Link>,
            })}
          </p>
          <h2>{t("hAvail")}</h2>
          <p>{t("pAvail")}</p>
        </Prose>
        <div className="mt-4">
          <MoreLink href="/safety">{t("safetyDocs")}</MoreLink>
        </div>
      </Container>
    </>
  );
}
