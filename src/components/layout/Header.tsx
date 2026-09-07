"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Button } from "@/components/ui/Button";

/**
 * N9 edge rail nav. One hairline row: wordmark hard left, a mono uppercase
 * link row and the utilities pushed to the far edge, with two panel-mounting
 * ticks at the top corners of the content area. Active link is bronze; the
 * drawn underline grows on hover. Sticky, with the scroll wash from
 * globals.css. Below lg the link row folds into a "Menu" disclosure that also
 * carries the utilities.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClasses = (active: boolean) =>
    cn(
      "font-mono text-[11.5px] uppercase tracking-[0.12em] transition-colors",
      active
        ? "rule-link text-accent"
        : "rule-link rule-link-off text-text-secondary hover:text-text-primary",
    );

  const linkRow = (
    <>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={linkClasses(isActive(item.href))}
        >
          {t(item.key)}
        </Link>
      ))}
      <a
        href={site.repoUrl}
        target="_blank"
        rel="noreferrer"
        className={linkClasses(false)}
      >
        {t("github")}
      </a>
    </>
  );

  return (
    <header
      data-site-header
      data-edge-nav
      data-menu-open={open ? "" : undefined}
      className="sticky top-0 z-50 border-b border-line-strong bg-bg-primary transition-colors duration-200"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-[1200px] px-5 sm:px-8"
      >
        <span className="absolute left-5 top-0 h-2 w-px bg-line-strong sm:left-8" />
        <span className="absolute right-5 top-0 h-2 w-px bg-line-strong sm:right-8" />
      </div>
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center" aria-label="openCMA home">
          <Wordmark className="text-[19px]" />
        </Link>

        <div className="flex min-w-0 items-center gap-7">
          <nav className="hidden items-center gap-6 lg:flex" aria-label={tc("mainNav")}>
            {linkRow}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
            <div className="ml-1 hidden lg:block">
              <Button href="/download" size="sm">
                {tc("download")}
              </Button>
            </div>
            <button
              type="button"
              aria-label={open ? tc("closeMenu") : tc("openMenu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="press ml-1 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary lg:hidden"
            >
              {open ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-bg-primary lg:hidden">
          <nav
            className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-3 sm:px-8"
            aria-label={tc("menu")}
            onClick={() => setOpen(false)}
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "border-b border-line py-3 font-mono text-[13px] uppercase tracking-[0.12em] transition-colors",
                  isActive(item.href) ? "text-accent" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
            <a
              href={site.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="border-b border-line py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-text-secondary"
            >
              {t("github")}
            </a>
            <Button href="/download" className="mt-4 w-full">
              {tc("downloadApp")}
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
