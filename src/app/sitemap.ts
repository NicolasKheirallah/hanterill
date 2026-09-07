import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { docsSlugs } from "@/lib/docs";
import { routing } from "@/i18n/routing";

// `output: export` builds this to a static sitemap.xml at build time.
export const dynamic = "force-static";

const paths = [
  "",
  "/features",
  "/features/battery-health",
  "/features/vehicle-diagnostics",
  "/features/live-data",
  "/features/service-functions",
  "/vehicles",
  "/download",
  "/docs",
  "/safety",
  "/privacy",
  "/about",
  ...docsSlugs().map((s) => `/docs/${s}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : path.startsWith("/docs/") ? 0.5 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${site.url}/${l}${path}`]),
        ),
      },
    })),
  );
}
