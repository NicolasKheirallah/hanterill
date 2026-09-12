import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";

/**
 * One place that builds per-page SEO metadata so canonical, hreflang and og
 * values can never drift between pages. Paths are absolute route paths
 * without the locale prefix; every URL is emitted with a trailing slash to
 * match the static export (`out/<path>/index.html`).
 */

const OG_IMAGE = "/assets/og.png";
const OG_ALT = "Hanterill: vehicle diagnostics for Volvo and Polestar";

function trailing(p: string) {
  return p.endsWith("/") ? p : `${p}/`;
}

export function buildMeta(args: {
  locale: string;
  path: string;
  title: string;
  description: string;
  /** Use the title verbatim, bypassing the layout's `%s | Hanterill` template. */
  absoluteTitle?: boolean;
}): Metadata {
  const { locale, path, title, description, absoluteTitle } = args;
  const canonical = `/${locale}${trailing(path)}`;
  const languages = {
    en: `/en${trailing(path)}`,
    sv: `/sv${trailing(path)}`,
    "x-default": `/en${trailing(path)}`,
  };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      url: canonical,
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

/** Reads the page's localized title/description from `seo.<id>` in the catalog. */
export async function pageMeta(args: {
  locale: string;
  path: string;
  id: string;
  absoluteTitle?: boolean;
}): Promise<Metadata> {
  const { locale, path, id, absoluteTitle } = args;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMeta({
    locale,
    path,
    title: t(`${id}.title`),
    description: t(`${id}.desc`),
    absoluteTitle,
  });
}

export const siteUrl = site.url;
