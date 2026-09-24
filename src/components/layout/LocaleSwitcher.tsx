"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * EN / SV. Switching keeps the current page and records the choice (next-intl
 * writes the locale cookie), so the site does not re-detect on the next visit.
 */
export function LocaleSwitcher() {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function set(locale: Locale) {
    if (locale === active) return;
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div
      className={cn(
        "press inline-flex h-11 overflow-hidden rounded-sm border border-line-strong font-mono text-[length:var(--text-micro)]",
        pending && "opacity-70",
      )}
      role="group"
      aria-label={t("language")}
      aria-busy={pending}
      data-pending={pending ? "" : undefined}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          disabled={pending}
          aria-pressed={l === active}
          aria-label={l === "sv" ? "Svenska" : "English"}
          className={cn(
            "min-w-11 px-3 uppercase transition-colors",
            l === active
              ? "bg-text-primary text-bg-primary"
              : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
