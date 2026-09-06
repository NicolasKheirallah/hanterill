import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerNav } from "@/lib/site";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-line bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-text-secondary">{t("blurb")}</p>
          </div>

          <nav aria-label={t("navLabel")} className="max-w-xl">
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
              {footerNav.map((col) =>
                col.links.map((l) => (
                  <li key={l.key}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[14px] text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {t(`links.${l.key}`)}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-[14px] text-text-secondary transition-colors hover:text-text-primary"
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

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 text-[13px] text-text-muted sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md leading-relaxed">{t("disclaimer")}</p>
          <p className="font-mono">{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
