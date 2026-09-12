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
      className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
