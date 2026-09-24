"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-motion-prefs";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";
import { DUR, EASE } from "@/lib/motion";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { CommandKButton } from "@/components/command/SiteCommand";

/**
 * N9 edge rail nav. One hairline row: wordmark hard left, a mono uppercase
 * link row and the utilities pushed to the far edge, with two panel-mounting
 * ticks at the top corners of the content area. Active link is bronze; the
 * drawn underline grows on hover. Sticky, with the scroll wash from
 * globals.css.
 *
 * The link row folds behind a "Menu" disclosure below `lg`, as design.md
 * specifies. It used to fold below `xl`, which left every 1024-1279px window
 * - including a 1280x800 laptop at 125% zoom - with no page links and no
 * primary CTA above the fold. Links are `whitespace-nowrap`: a wrapped mono
 * label breaks the one-row contract and knocks the whole rail off its
 * baseline. GitHub lives in the utility cluster rather than the link row, so
 * the eight page destinations fit from 1024px up.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotionSafe();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Scroll lock. The sheet is fixed and full-height, so the page behind it
  // must not move; padding compensates for the removed scrollbar.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Escape closes; Tab is trapped inside the sheet; focus returns to the
  // trigger. Without the trap, Tab walked straight out of an aria-modal
  // surface into the page behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = sheetRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Move focus into the sheet on open, and back to the trigger on close.
  useEffect(() => {
    if (open) {
      const root = sheetRef.current;
      const first = root?.querySelector<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      first?.focus();
    } else if (triggerRef.current && document.activeElement === document.body) {
      triggerRef.current.focus();
    }
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // The rail carries the five destinations that answer "what is this and can I
  // use it" from `lg`; the three secondary ones join at `xl` where there is
  // room. Everything stays reachable at `lg` through the menu disclosure. The
  // full eight never fitted at 1024px - the row overflowed the viewport by
  // 83px - and an overflowing rail is worse than a two-tier one.
  const CORE = new Set([
    "/features",
    "/vehicles",
    "/network",
    "/docs",
    "/changelog",
  ]);

  const linkClasses = (active: boolean) =>
    cn(
      "rule-link whitespace-nowrap font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] transition-colors",
      active
        ? "text-accent"
        : "rule-link-off text-text-secondary hover:text-text-primary",
    );

  return (
    <>
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

        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center"
            aria-label={tc("homeAria")}
          >
            <Wordmark className="text-[19px]" />
          </Link>

          <div className="flex min-w-0 items-center gap-4 xl:gap-7">
            <nav
              className="hidden items-center gap-3 lg:flex xl:gap-5"
              aria-label={tc("mainNav")}
            >
              {nav.map((item) => {
                const core = CORE.has(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      linkClasses(isActive(item.href)),
                      !core && "hidden xl:inline",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>

            {/* Every control in this cluster is h-11 (44px): the old h-9 row put
              34-36px targets in reach of a thumb, below the touch floor. The
              shared height still reads as one baseline. */}
            <div className="flex shrink-0 items-center gap-1.5">
              <CommandKButton />
              <a
                href={site.repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={t("github")}
                className="press hidden h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary xl:inline-flex"
              >
                <GithubMark className="h-4 w-4" />
              </a>
              <LocaleSwitcher />
              <ThemeToggle />
              <div className="ml-1 hidden lg:block">
                <Button href="/download" size="sm">
                  {tc("download")}
                </Button>
              </div>
              <button
                ref={triggerRef}
                type="button"
                aria-label={open ? tc("closeMenu") : tc("openMenu")}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((v) => !v)}
                className="press ml-1 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary xl:hidden"
              >
                {open ? (
                  <X className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Menu className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* The sheet lives OUTSIDE <header>. The scrolled/menu-open header gains
          `backdrop-filter`, and a filtered ancestor becomes the containing
          block for `position: fixed` descendants - inside the header the sheet
          collapsed to 1px tall. It is a sibling, so it positions against the
          viewport as intended. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            id="mobile-menu"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={tc("menu")}
            data-material
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: reduce ? DUR.fast : DUR.base,
              ease: EASE.out,
            }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-bg-primary xl:hidden"
          >
            <nav
              className="mx-auto flex max-w-[1200px] flex-col px-5 py-3 sm:px-8"
              aria-label={tc("menu")}
              onClick={close}
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center border-b border-line font-mono text-[length:var(--text-ui)] uppercase tracking-[length:var(--track-label)] transition-colors",
                    isActive(item.href)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
              <a
                href={site.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center border-b border-line font-mono text-[length:var(--text-ui)] uppercase tracking-[length:var(--track-label)] text-text-secondary"
              >
                {t("github")}
              </a>
              <Button href="/download" className="mt-4 w-full">
                {tc("downloadApp")}
              </Button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** GitHub mark. lucide-react v1 dropped brand glyphs, so this is inline. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
