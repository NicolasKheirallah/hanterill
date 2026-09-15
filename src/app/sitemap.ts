import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { docsSlugs } from "@/lib/docs";
import { getLatestRelease } from "@/lib/github";
import { routing } from "@/i18n/routing";

// Required under output: "export" — the build errors on this route otherwise.
export const dynamic = "force-static";

const paths = [
  "",
  "/features",
  "/features/battery-health",
  "/features/vehicle-diagnostics",
  "/features/live-data",
  "/features/system-telemetry",
  "/features/inspection-reports",
  "/features/sessions-and-evidence",
  "/features/service-functions",
  "/vehicles",
  "/network",
  "/download",
  "/changelog",
  "/screenshots",
  "/troubleshooting",
  "/docs",
  "/safety",
  "/privacy",
  "/about",
  "/projects",
  ...docsSlugs().map((s) => `/docs/${s}`),
];

/**
 * `lastModified` is emitted **only where it is a real fact**.
 *
 * It used to be `new Date()` for all 152 entries, so every URL in the sitemap
 * claimed to have changed at the same instant — the build time. That is not a
 * smaller truth than knowing nothing; it is a false one, and it trains a
 * crawler to ignore the field. Nothing in this repository records a per-page
 * modification date (the MDX files carry no frontmatter), so for every page
 * except the changelog the honest value is to omit the element entirely.
 *
 * The changelog page genuinely reflects the newest release, so it gets the
 * release date.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const release = await getLatestRelease();
  const releaseDate = release?.publishedAt ? new Date(release.publishedAt) : null;

  return paths.flatMap((path) =>
    routing.locales.map((locale) => {
      const url = `${site.url}/${locale}${path}/`;
      const entry: MetadataRoute.Sitemap[number] = {
        url,
        changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
        priority: path === "" ? 1 : path.startsWith("/docs/") ? 0.5 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${site.url}/${l}${path}/`]),
          ),
        },
      };
      if (path === "/changelog" && releaseDate) entry.lastModified = releaseDate;
      return entry;
    }),
  );
}
