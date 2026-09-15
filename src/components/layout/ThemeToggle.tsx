"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "light" | "dark" | "system";
const KEY = "hanterill-theme";
const EVENT = "hanterill-theme-change";
const order: Mode[] = ["system", "light", "dark"];
const MODE_KEY: Record<Mode, "themeSystem" | "themeLight" | "themeDark"> = {
  system: "themeSystem",
  light: "themeLight",
  dark: "themeDark",
};

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : "system";
  } catch {
    return "system";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function apply(mode: Mode) {
  const root = document.documentElement;
  // Dark <-> light is the largest brightness change in the product. Flip every
  // colour token in one frame and it reads as a flash; a short cross-fade of
  // the colour properties only (never layout, never transform) reads as the
  // panel lighting up. Dropped entirely under reduced motion by globals.css.
  root.setAttribute("data-theme-switching", "");
  window.setTimeout(() => root.removeAttribute("data-theme-switching"), 260);

  if (mode === "system") {
    root.removeAttribute("data-theme");
    try {
      localStorage.removeItem(KEY);
    } catch {}
  } else {
    root.setAttribute("data-theme", mode);
    try {
      localStorage.setItem(KEY, mode);
    } catch {}
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode);
  const t = useTranslations("common");

  const cycle = useCallback(() => {
    apply(order[(order.indexOf(mode) + 1) % order.length]);
  }, [mode]);

  const Icon = mode === "system" ? Monitor : mode === "dark" ? Moon : Sun;
  const label = t("themeAria", { mode: t(MODE_KEY[mode]) });

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="press inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
