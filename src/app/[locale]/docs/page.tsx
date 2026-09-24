import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
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

/**
 * Task entry points, in the order a new owner meets them. The grouped
 * reference below stays complete; these four answer the goal a reader arrives
 * with before they know the taxonomy. Hrefs are structure; labels live in the
 * message catalog (`docs.tasks`).
 */
const docTasks = [
  { key: "connect", href: "/docs/connection" },
  { key: "support", href: "/docs/supported-vehicles" },
  { key: "faults", href: "/docs/dtc-scanning" },
  { key: "battery", href: "/docs/battery-diagnostics" },
] as const;

export default async function DocsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");

  return (
    <div>
      <h1 className="max-w-[20ch] text-[length:var(--text-display)] leading-[1.02]">{t("title")}</h1>
      <p className="mt-4 max-w-[42rem] text-lg leading-relaxed text-text-secondary">{t("lead")}</p>

      <section className="mt-10" aria-labelledby="docs-tasks-heading">
        <h2 id="docs-tasks-heading" className="text-[length:var(--text-title)] leading-tight">
          {t("tasks.title")}
        </h2>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {docTasks.map((task) => (
            <li key={task.href} className="bg-surface">
              <Link
                href={task.href}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-bg-secondary"
              >
                <span className="flex items-center justify-between text-[16px] font-medium tracking-tight text-text-primary">
                  {t(`tasks.${task.key}.title`)}
                  <ArrowRight
                    className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {t(`tasks.${task.key}.body`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 space-y-10">
        <h2 className="text-[length:var(--text-title)] leading-tight">{t("allDocs")}</h2>
        {docGroups.map((group) => (
          <section key={group}>
            <h3 className="font-mono text-[12px] text-text-muted">
              {t(`groups.${group}`)}
            </h3>
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
