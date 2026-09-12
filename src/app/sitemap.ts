import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { docsSlugs } from "@/lib/docs";
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
  "/docs",
  "/safety",
  "/privacy",
  "/about",
  "/projects",
  ...docsSlugs().map((s) => `/docs/${s}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.flatMap((path) =>
    routing.locales.map((locale) => {
      const url = `${site.url}/${locale}${path}/`;
      return {
        url,
        lastModified: now,
        changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
        priority: path === "" ? 1 : path.startsWith("/docs/") ? 0.5 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${site.url}/${l}${path}/`]),
          ),
        },
      };
    }),
  );
}
