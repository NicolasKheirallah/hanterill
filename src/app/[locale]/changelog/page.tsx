import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { ExternalLink, GitCommitVertical } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { getReleases, getTags, formatBytes, type Release } from "@/lib/github";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/changelog", id: "changelog" });
}

/** Minimal, safe renderer for a GitHub release body: no HTML, text only. */
function Notes({ body, fallback }: { body: string; fallback: string }) {
  if (!body.trim()) return <p className="text-[13px] text-text-muted">{fallback}</p>;
  const blocks: { kind: "h" | "li" | "p"; text: string }[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const h = line.match(/^#{2,4}\s+(.*)$/);
    const li = line.match(/^[-*]\s+(.*)$/);
    if (h) blocks.push({ kind: "h", text: h[1].replace(/[*_`]/g, "") });
    else if (li) blocks.push({ kind: "li", text: li[1].replace(/`/g, "") });
    else if (!line.startsWith("<") && !line.startsWith("![") && !line.startsWith("|"))
      blocks.push({ kind: "p", text: line.replace(/[*_`]/g, "") });
  }
  return (
    <div className="mt-3 space-y-1.5">
      {blocks.map((b, i) =>
        b.kind === "h" ? (
          <p key={i} className="pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {b.text}
          </p>
        ) : b.kind === "li" ? (
          <p key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-text-secondary">
            <span aria-hidden className="text-line-strong">
              ─
            </span>
            <span>{b.text}</span>
          </p>
        ) : (
          <p key={i} className="text-[13.5px] leading-relaxed text-text-secondary">
            {b.text}
          </p>
        ),
      )}
    </div>
  );
}

function ReleaseRow({ release, t, first }: { release: Release; t: (k: string) => string; first?: boolean }) {
  return (
    <li className="py-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono text-[18px] text-text-primary">{release.version}</span>
        {first || release.prerelease ? (
          <StatusMarker tone={first ? "ok" : "warning"}>{first ? t("latest") : t("prerelease")}</StatusMarker>
        ) : null}
        {release.publishedAt ? (
          <time className="font-mono text-[12px] text-text-muted" dateTime={release.publishedAt}>
            {new Date(release.publishedAt).toLocaleDateString("en-CA")}
          </time>
        ) : null}
      </div>
      {release.name && release.name !== release.version ? (
        <p className="mt-1 text-[14px] text-text-secondary">{release.name}</p>
      ) : null}
      <Notes body={release.body} fallback={t("noNotes")} />
      {release.assets.length > 0 ? (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {release.assets.map((a) => (
            <li key={a.downloadUrl} className="flex items-baseline justify-between gap-4 py-1.5 font-mono text-[12px]">
              <a
                href={a.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-text-primary transition-colors hover:text-accent"
              >
                {a.name}
              </a>
              <span className="tnum shrink-0 text-text-muted">{formatBytes(a.size)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3">
        <MoreLink href={release.url} external>
          {t("releaseOnGitHub")}
        </MoreLink>
      </div>
    </li>
  );
}

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("changelog");
  const [releases, tags] = await Promise.all([getReleases(10), getTags()]);

  return (
    <>
      <LocalizedPageHeader id="changelog" />

      <Container className="py-xl lg:py-2xl">
        {releases.length > 0 ? (
          <ol className="divide-y divide-line border-t border-line-strong">
            {releases.map((r, i) => (
              <ReleaseRow key={r.version} release={r} t={t} first={i === 0} />
            ))}
          </ol>
        ) : tags.length > 0 ? (
          <div>
            <p className="text-[14px] leading-relaxed text-text-secondary">{t("noReleasesYet")}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <a
                    href={`${site.repoUrl}/releases/tag/${tag}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-1.5 font-mono text-[12px] text-text-primary transition-colors hover:border-line-strong"
                  >
                    <GitCommitVertical className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
                    {tag}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-text-secondary">{t("unavailable")}</p>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line-strong pt-6">
          <MoreLink href={site.releasesUrl} external>
            <span className="inline-flex items-center gap-1.5">
              {t("viewAll")} <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
            </span>
          </MoreLink>
          <MoreLink href={`${site.repoUrl}/blob/main/CHANGELOG.md`} external>
            {t("changelogFile")}
          </MoreLink>
          <MoreLink href="/docs/releases">How releases are made</MoreLink>
        </div>
      </Container>
    </>
  );
}
