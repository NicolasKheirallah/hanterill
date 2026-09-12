import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { docGroups, docSummary, docTitle, docs } from "@/lib/docs";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/docs", id: "docs" });
}

export default async function DocsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");

  return (
    <div>
      <h1 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-[42rem] text-lg leading-relaxed text-text-secondary">{t("lead")}</p>

      <div className="mt-10 space-y-10">
        {docGroups.map((group) => (
          <section key={group}>
            <h2 className="font-mono text-[12px] text-text-muted">
              {t(`groups.${group}`)}
            </h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {docs
                .filter((d) => d.group === group)
                .map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/docs/${d.slug}`}
                      className="group grid gap-1 py-4 transition-colors hover:bg-bg-secondary sm:grid-cols-[1fr_1.6fr] sm:gap-8"
                    >
                      <span className="text-[15px] font-medium text-text-primary">{docTitle(d, locale)}</span>
                      <span className="text-[14px] text-text-secondary">{docSummary(d, locale)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

