import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Prose } from "@/components/ui/Prose";
import { DocNavLink } from "@/components/docs/DocNavLink";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { docs, getDoc, getDocToc, docsSlugs } from "@/lib/docs";
import { docLoaders } from "@/lib/docs-registry";

export function generateStaticParams() {
  return docsSlugs().map((slug) => ({ slug: [slug] }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ locale: string; slug: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getDoc(slug.join("/"));
  if (!doc) return {};
  const t = await getTranslations({ locale, namespace: "docs" });
  return {
    title: `${doc.title} · ${t("eyebrow")}`,
    description: doc.summary,
    alternates: { canonical: `/${locale}/docs/${doc.slug}` },
  };
}

export default async function DocPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const key = slug.join("/");
  const doc = getDoc(key);
  const loader = docLoaders[key];
  if (!doc || !loader) notFound();

  const [{ default: MDXContent }, toc, t] = await Promise.all([
    loader(),
    getDocToc(doc.slug),
    getTranslations("docs"),
  ]);

  const idx = docs.findIndex((d) => d.slug === doc.slug);
  const prev = docs[idx - 1];
  const next = docs[idx + 1];

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_180px] xl:gap-10">
      <article>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{t(`groups.${doc.group}`)}</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 text-lg text-text-secondary">{doc.summary}</p>

        {locale === "sv" ? (
          <p className="mt-4 rounded-sm border border-line bg-bg-secondary px-3 py-2 font-mono text-[12px] text-text-muted">
            {t("englishOnly")}
          </p>
        ) : null}

        <div className="mt-8">
          <Prose>
            <MDXContent />
          </Prose>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 border-t border-line pt-6 text-[13px]">
          {prev ? (
            <DocNavLink
              href={`/${locale}/docs/${prev.slug}`}
              type="doc-back"
              className="min-w-0 text-text-secondary hover:text-text-primary"
            >
              <span className="block font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {t("previous")}
              </span>
              <span className="block text-balance">{prev.title}</span>
            </DocNavLink>
          ) : (
            <span />
          )}
          {next ? (
            <DocNavLink
              href={`/${locale}/docs/${next.slug}`}
              type="doc-forward"
              className="col-start-2 min-w-0 text-right text-text-secondary hover:text-text-primary"
            >
              <span className="block font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {t("next")}
              </span>
              <span className="block text-balance">{next.title}</span>
            </DocNavLink>
          ) : (
            <span />
          )}
        </div>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={toc} />
        </div>
      </aside>
    </div>
  );
}
