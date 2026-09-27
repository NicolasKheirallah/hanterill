import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { ExternalLink, GitCommitVertical } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Section, MoreLink } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { ReleaseNotes, releaseSummary } from "@/components/changelog/ReleaseNotes";
import { getReleases, getTags, formatBytes, sameVersionRef, type Release } from "@/lib/github";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/changelog", id: "changelog" });
}

/** Anchors so `/changelog#v0.2.0` resolves, and so each entry is linkable. */
function anchor(version: string) {
  return version.replace(/[^\w.-]/g, "-");
}

function ReleaseRow({
  release,
  locale,
  t,
  first,
}: {
  release: Release;
  locale: string;
  t: (k: string, values?: Record<string, string | number>) => string;
  first?: boolean;
}) {
  const date = release.publishedAt
    ? new Date(release.publishedAt).toLocaleDateString(locale === "sv" ? "sv-SE" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // A release whose name is just the version restated ("v0.2.2" under a
  // "v0.2.2" header) says nothing and renders as a stutter.
  const name =
    release.name && !sameVersionRef(release.name, release.version) && !/^changelog$/i.test(release.name)
      ? release.name
      : null;

  const anchorLink = (
    <a
      href={`#${anchor(release.version)}`}
      aria-label="Link to this release"
      className="font-mono text-[0.75em] text-text-muted no-underline opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
    >
      #
    </a>
  );

  const totalSize = release.assets.reduce((n, a) => n + a.size, 0);

  const body = (
    <>
      {name ? <p className="mt-1 text-[length:var(--text-body)] text-text-secondary">{name}</p> : null}
      {release.body.trim() ? (
        <ReleaseNotes body={release.body} limit={14} moreLabel={t("showFullNotes")} />
      ) : (
        <p className="mt-4 text-[length:var(--text-ui)] text-text-muted">{t("noNotes")}</p>
      )}
      {release.assets.length > 0 ? (
        <details className="mt-5">
          <summary className="inline-flex cursor-pointer list-none items-baseline gap-2 font-mono text-[length:var(--text-meta)] text-text-muted transition-colors hover:text-text-primary [&::-webkit-details-marker]:hidden">
            {t("installers", { count: release.assets.length, size: formatBytes(totalSize) })}
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {release.assets.map((a) => (
              <li
                key={a.downloadUrl}
                className="flex items-baseline justify-between gap-4 py-1.5 font-mono text-[length:var(--text-meta)]"
              >
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
        </details>
      ) : null}
      <div className="mt-4">
        <MoreLink href={release.url} external>
          {t("releaseOnGitHub")}
        </MoreLink>
      </div>
    </>
  );

  // One timeline: a hairline rail with a tick per release (bronze for the
  // newest), the newest entry open, older ones collapsed to version, date and
  // a one-line summary so the history is scannable without expanding.
  const tick = (
    <span
      aria-hidden
      className={
        first
          ? "absolute top-[1.1rem] -left-[4.5px] h-[9px] w-[9px] rotate-45 border border-accent bg-accent"
          : "absolute top-[2.35rem] -left-[4.5px] h-[9px] w-[9px] rotate-45 border border-line-strong bg-bg-primary"
      }
    />
  );

  if (first) {
    return (
      <li id={anchor(release.version)} className="group relative pb-10 pl-6 pt-2 sm:pl-8">
        {tick}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-mono text-[length:var(--text-title)] text-text-primary">{release.version}</span>
          {release.prerelease ? <StatusMarker tone="warning">{t("prerelease")}</StatusMarker> : null}
          <StatusMarker tone="ok">{t("latest")}</StatusMarker>
          {date && release.publishedAt ? (
            <time className="font-mono text-[length:var(--text-meta)] text-text-muted" dateTime={release.publishedAt}>
              {date}
            </time>
          ) : null}
          {anchorLink}
        </div>
        {body}
      </li>
    );
  }

  const summary = releaseSummary(release.body);

  return (
    <li id={anchor(release.version)} className="group relative pl-6 sm:pl-8">
      {tick}
      <details className="py-7">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[length:var(--text-body)] text-text-primary transition-colors group-hover:text-accent">
            {release.version}
          </span>
          {release.prerelease ? <StatusMarker tone="warning">{t("prerelease")}</StatusMarker> : null}
          {date && release.publishedAt ? (
            <time
              className="shrink-0 font-mono text-[length:var(--text-micro)] text-text-muted"
              dateTime={release.publishedAt}
            >
              {date}
            </time>
          ) : null}
          {summary ? (
            <span className="min-w-0 flex-1 truncate text-[length:var(--text-body)] text-text-secondary" title={summary}>
              {summary}
            </span>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          <span className="ml-auto shrink-0 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
            {t("showNotes")}
          </span>
          {anchorLink}
        </summary>
        {body}
      </details>
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

      <Section>
        {locale !== "en" ? (
          <p className="mb-8 rounded-sm border border-line bg-bg-secondary px-3 py-2 font-mono text-[length:var(--text-meta)] text-text-muted">
            {t("notesEnglish")}
          </p>
        ) : null}
        {releases.length > 0 ? (
          <>
            <ol className="relative ml-1 border-l border-line">
              {releases.map((r, i) => (
                <ReleaseRow key={r.version} release={r} locale={locale} t={t} first={i === 0} />
              ))}
            </ol>
            <p className="mt-6 font-mono text-[length:var(--text-micro)] leading-relaxed text-text-muted">
              {t("fetchedAt", { version: releases[0].version })}
            </p>
          </>
        ) : tags.length > 0 ? (
          <div>
            <p className="text-[length:var(--text-body)] leading-relaxed text-text-secondary">
              {t("noReleasesYet")}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <a
                    href={`${site.repoUrl}/releases/tag/${tag}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-line-strong bg-surface px-3 py-1.5 font-mono text-[length:var(--text-meta)] text-text-primary transition-colors hover:border-text-primary"
                  >
                    <GitCommitVertical className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
                    {tag}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[length:var(--text-body)] leading-relaxed text-text-secondary">
            {t("unavailable")}
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line-strong pt-6">
          <MoreLink href={site.releasesUrl} external>
            <span className="inline-flex items-center gap-1.5">
              {t("viewAll")} <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
            </span>
          </MoreLink>
          <MoreLink href={`${site.repoUrl}/blob/${site.websiteBranch}/CHANGELOG.md`} external>
            {t("changelogFile")}
          </MoreLink>
          <MoreLink href={`${site.url}/rss.xml`} external>
            {t("rssFeed")}
          </MoreLink>
          <MoreLink href="/docs/releases">{t("howReleasesWork")}</MoreLink>
        </div>
      </Section>
    </>
  );
}
