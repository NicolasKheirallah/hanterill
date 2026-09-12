import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { evidenceDemo } from "@/lib/demo-data";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/sessions-and-evidence", id: "sessionsEvidence" });
}

async function BeforeAfter() {
  const t = await getTranslations("features");
  const cols = [
    { label: t("beforeRepair"), d: evidenceDemo.before },
    { label: t("afterRepair"), d: evidenceDemo.after },
  ];
  return (
    <div className="grid grid-cols-2">
      {cols.map((c, i) => (
        <div key={c.label} className={cn("border border-line bg-surface p-5", i === 1 && "border-l-0")}>
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{c.label}</div>
          <div className="tnum mt-3 font-mono text-[2rem] leading-none text-text-primary">{c.d.total}</div>
          <div className="text-[12px] text-text-secondary">{t("totalDtcs")}</div>
        </div>
      ))}
    </div>
  );
}

export default async function SessionsEvidencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("body.sessionsEvidence");
  const diffs = t.raw("diffs") as string[][];
  return (
    <>
      <LocalizedPageHeader id="sessionsEvidence" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Prose>
            <h2>{t("hArchive")}</h2>
            <p>{t("pArchive")}</p>
            <h2>{t("hCompare")}</h2>
            <p>{t("pCompare")}</p>
            <h2>{t("hReplay")}</h2>
            <p>{t("pReplay")}</p>
            <h2>{t("hExports")}</h2>
            <p>{t("pExports")}</p>
          </Prose>
          <div>
            <BeforeAfter />
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {diffs.map(([name, desc]) => (
                <li key={name} className="py-3">
                  <div className="text-[14px] text-text-primary">{name}</div>
                  <div className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{desc}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <MoreLink href="/docs/cli">{t("cliLink")}</MoreLink>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-line-strong pt-8">
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-text-secondary">
            {t.rich("pUsesArchive", {
              link: (chunks) => (
                <Link href="/features/inspection-reports" className="text-accent underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </Container>
    </>
  );
}
