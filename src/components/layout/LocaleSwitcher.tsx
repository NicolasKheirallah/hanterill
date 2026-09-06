"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
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
        "inline-flex overflow-hidden rounded-sm border border-line font-mono text-[11px]",
        pending && "opacity-60",
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={l === active}
          aria-label={l === "sv" ? "Svenska" : "English"}
          className={cn(
            "px-2 py-1.5 uppercase transition-colors",
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
