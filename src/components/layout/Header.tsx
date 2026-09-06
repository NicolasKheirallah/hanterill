"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      data-site-header
      data-menu-open={open ? "" : undefined}
      className="sticky top-0 z-50 border-b border-transparent transition-colors duration-200"
    >
      <div className="mx-auto flex h-15 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center" aria-label="openCMA home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-sm px-3 py-2 text-[14px] transition-colors",
                  active ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t(item.key)}
                {active ? (
                  <motion.span
                    layoutId={reduce ? undefined : "nav-active"}
                    className="absolute inset-x-3 -bottom-px h-px bg-accent"
                    transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                ) : null}
              </Link>
            );
          })}
          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm px-3 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
          >
            {t("github")}
          </a>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button href="/download" size="sm">
            {tc("download")}
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            {open ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-bg-primary lg:hidden">
          <nav
            className="mx-auto flex max-w-[1200px] flex-col px-5 py-3 sm:px-8"
            aria-label="Mobile"
            onClick={() => setOpen(false)}
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-3 text-[15px] text-text-secondary transition-colors hover:text-text-primary"
              >
                {t(item.key)}
              </Link>
            ))}
            <a
              href={site.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="border-b border-line py-3 text-[15px] text-text-secondary"
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
