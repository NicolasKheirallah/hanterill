import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Swedish falls back to English for any key it has not translated yet, so a
  // partially translated catalog never shows a raw key.
  const messages = (await import(`../messages/${locale}.json`)).default;
  const fallback = (await import(`../messages/${routing.defaultLocale}.json`)).default;

  return {
    locale,
    messages: locale === routing.defaultLocale ? messages : deepMerge(fallback, messages),
  };
});

function deepMerge<T>(base: T, over: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object") {
      out[k] = deepMerge(out[k], v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
