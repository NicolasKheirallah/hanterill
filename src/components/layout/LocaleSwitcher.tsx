"use client";

import * as React from "react";
import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

type WithAddTransitionType = { unstable_addTransitionType?: (type: string) => void };
const addTransitionType = (React as WithAddTransitionType).unstable_addTransitionType;

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
    // React 19.2 starts a view transition for this navigation. Only the
    // content region carries view-transition-name: page-main, so the header
    // and footer stay put; globals.css crossfades it and disables the effect
    // under reduced motion. Browsers without the API just swap instantly.
    startTransition(() => {
      addTransitionType?.("locale");
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
