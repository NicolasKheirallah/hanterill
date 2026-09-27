import { getReleases, sameVersionRef } from "@/lib/github";
import { releaseSummary } from "@/components/changelog/ReleaseNotes";
import { site } from "@/lib/site";

// Required under output: "export" — the handler is evaluated at build time
// (the same seam sitemap.xml uses), so the feed is a plain static file that
// GitHub Pages serves without any server.
export const dynamic = "force-static";

/**
 * The release feed. The desktop app never phones home, so the website is the
 * update-notification surface: this file is what a reader subscribes to.
 */

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const releases = await getReleases(20);
  const items = releases
    .map((r) => {
      const title =
        r.name && !sameVersionRef(r.name, r.version) && !/^changelog$/i.test(r.name)
          ? `${r.version} — ${r.name}`
          : r.version;
      const pubDate = r.publishedAt
        ? new Date(r.publishedAt).toUTCString()
        : new Date().toUTCString();
      return [
        "    <item>",
        `      <title>${esc(title)}</title>`,
        `      <link>${esc(r.url)}</link>`,
        `      <guid isPermaLink="true">${esc(r.url)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${esc(releaseSummary(r.body, 500))}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuild = releases[0]?.publishedAt
    ? new Date(releases[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hanterill releases</title>
    <link>${esc(`${site.url}/changelog/`)}</link>
    <description>New Hanterill releases: version notes, dates and installers for supported Volvo and Polestar vehicles.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
