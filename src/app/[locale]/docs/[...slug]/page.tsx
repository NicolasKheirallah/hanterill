import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Prose } from "@/components/ui/Prose";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { docs, docSummary, docTitle, getDoc, getDocToc, docsSlugs } from "@/lib/docs";
import { docIsTranslated, docLoaderFor } from "@/lib/docs-registry";
import { buildMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { PencilLine } from "lucide-react";

export function generateStaticParams() {
  return docsSlugs().map((slug) => ({ slug: [slug] }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ locale: string; slug: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getDoc(slug.join("/"));
  if (!doc) return {};
  return buildMeta({
    locale,
    path: `/docs/${doc.slug}`,
    title: docTitle(doc, locale),
    description: docSummary(doc, locale),
    absoluteTitle: true,
  });
}

export default async function DocPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const key = slug.join("/");
  const doc = getDoc(key);
  const loader = docLoaderFor(locale, key);
  if (!doc || !loader) notFound();
  const translated = docIsTranslated(locale, key);

  const [{ default: MDXContent }, toc, t] = await Promise.all([
    loader(),
    getDocToc(doc.slug, locale),
    getTranslations("docs"),
  ]);

  const idx = docs.findIndex((d) => d.slug === doc.slug);
  const prev = docs[idx - 1];
  const next = docs[idx + 1];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hanterill", item: `${site.url}/${locale}/` },
      { "@type": "ListItem", position: 2, name: t("eyebrow"), item: `${site.url}/${locale}/docs/` },
      { "@type": "ListItem", position: 3, name: docTitle(doc, locale) },
    ],
  };

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_180px] xl:gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <article>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{t(`groups.${doc.group}`)}</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">{docTitle(doc, locale)}</h1>
        <p className="mt-3 text-lg text-text-secondary">{docSummary(doc, locale)}</p>

        {locale === "sv" && !translated ? (
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
            <Link
              href={`/docs/${prev.slug}`}
              className="min-w-0 text-text-secondary hover:text-text-primary"
            >
              <span className="block font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {t("previous")}
              </span>
              <span className="block text-balance">{docTitle(prev, locale)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="col-start-2 min-w-0 text-right text-text-secondary hover:text-text-primary"
            >
              <span className="block font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {t("next")}
              </span>
              <span className="block text-balance">{docTitle(next, locale)}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <div className="no-print mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5">
          <a
            href={site.docEditUrl(doc.slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-text-muted transition-colors hover:text-text-primary"
          >
            <PencilLine className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t("editPage")}
          </a>
          <a
            href={`${site.repoUrl}/tree/main/docs`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-text-muted transition-colors hover:text-text-primary"
          >
            {t("repoDocs")}
          </a>
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
