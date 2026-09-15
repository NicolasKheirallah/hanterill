"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { docGroups, docTitle, docs } from "@/lib/docs";
import { cn } from "@/lib/cn";

/**
 * The docs navigation. It used to compare `pathname === href`, which never
 * matched: the site sets `trailingSlash: true`, so next-intl reports
 * `/en/docs/cli/` while the link is `/docs/cli`. No page in the docs was ever
 * marked current. Header.tsx had the correct comparison all along.
 *
 * Rendered twice: as the sticky sidebar from `lg`, and as a disclosure above
 * the article below it - there was previously no way to move between the 19
 * docs on a phone except the prev/next pair at the foot of each page.
 */
export function DocsSidebar({ className }: { className?: string }) {
  const raw = usePathname();
  const pathname = raw.endsWith("/") && raw !== "/" ? raw.slice(0, -1) : raw;
  const locale = useLocale();
  const t = useTranslations("docs");

  /** The links are `<h2>`s before the article's `<h1>`; a plain list is correct. */
  return (
    <nav aria-label={t("eyebrow")} className={cn("text-[length:var(--text-ui)]", className)}>
      {docGroups.map((group) => (
        <div key={group} className="mb-6">
          <p className="mb-2 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
            {t(`groups.${group}`)}
          </p>
          <ul className="border-l border-line">
            {docs
              .filter((d) => d.group === group)
              .map((d) => {
                const href = `/docs/${d.slug}`;
                const active = pathname === href;
                return (
                  <li key={d.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "-ml-px block border-l-2 py-1.5 pl-3 transition-colors",
                        active
                          ? "border-accent text-text-primary"
                          : "border-transparent text-text-secondary hover:border-line-strong hover:text-text-primary",
                      )}
                    >
                      {docTitle(d, locale)}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
