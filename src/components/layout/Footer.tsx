import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerNav, site } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { FooterYear } from "./FooterYear";

/**
 * Statement footer. One large grotesk closing line, then a hairline, then a
 * mono spec plate laid as columns (repository, licence, platforms, year) - no
 * bar-chained separator strip. The independence disclaimer in small print,
 * then a flat link nav of the masthead destinations. Nothing becomes a link
 * grid.
 */
export function Footer() {
  const t = useTranslations("footer");
  const tm = useTranslations("footer.meta");
  const tc = useTranslations("common");
  const th = useTranslations("hero");

  const meta = [
    {
      label: tm("repository"),
      value: (
        <a
          href={site.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="rule-link text-text-primary"
        >
          {site.repoUrl.replace("https://", "")}
        </a>
      ),
    },
    { label: tm("license"), value: tc("privateUse") },
    { label: tm("platforms"), value: th("platforms") },
    { label: tm("year"), value: <FooterYear /> },
  ];

  return (
    <footer data-statement-footer className="border-t border-line-strong bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex items-start justify-between gap-6">
          <p className="max-w-[24ch] font-[family-name:var(--font-display)] text-[1.9rem] font-medium leading-[1.05] tracking-[-0.024em] sm:text-[2.4rem]">
            {t("tagline")}
          </p>
          <Wordmark className="mt-1 shrink-0 text-[15px]" />
        </div>

        <p className="mt-5 max-w-[60ch] font-mono text-[12.5px] leading-relaxed text-text-secondary">
          {t("blurb")}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                {m.label}
              </dt>
              <dd className="mt-1.5 font-mono text-[12.5px] text-text-secondary">{m.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-[78ch] text-[12.5px] leading-relaxed text-text-muted">
          {t("disclaimer")}
        </p>

        <nav aria-label={t("navLabel")} className="mt-10 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerNav.flatMap((col) =>
              col.links.map((l) => (
                <li key={l.key}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {t(`links.${l.key}`)}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {t(`links.${l.key}`)}
                    </Link>
                  )}
                </li>
              )),
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
