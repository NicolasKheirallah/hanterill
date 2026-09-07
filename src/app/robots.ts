import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Required under output: "export" — the build errors on this route otherwise.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
