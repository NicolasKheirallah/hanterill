import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { ExternalLink, GitCommitVertical } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Section, MoreLink } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { ReleaseNotes } from "@/components/changelog/ReleaseNotes";
import { getReleases, getTags, formatBytes, type Release } from "@/lib/github";
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
  t: (k: string) => string;
  first?: boolean;
}) {
  const date = release.publishedAt
    ? new Date(release.publishedAt).toLocaleDateString(locale === "sv" ? "sv-SE" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const head = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="font-mono text-[length:var(--text-title)] text-text-primary">{release.version}</span>
      {first || release.prerelease ? (
        <StatusMarker tone={first ? "ok" : "warning"}>
          {first ? t("latest") : t("prerelease")}
        </StatusMarker>
      ) : null}
      {date && release.publishedAt ? (
        <time className="font-mono text-[length:var(--text-meta)] text-text-muted" dateTime={release.publishedAt}>
          {date}
        </time>
      ) : null}
    </div>
  );

  const body = (
    <>
      {release.name && release.name !== release.version ? (
        <p className="mt-1 text-[length:var(--text-body)] text-text-secondary">{release.name}</p>
      ) : null}
      {release.body.trim() ? (
        <ReleaseNotes body={release.body} limit={14} moreLabel={t("showFullNotes")} />
      ) : (
        <p className="mt-4 text-[length:var(--text-ui)] text-text-muted">{t("noNotes")}</p>
      )}
      {release.assets.length > 0 ? (
        <ul className="mt-5 divide-y divide-line border-y border-line">
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
      ) : null}
      <div className="mt-4">
        <MoreLink href={release.url} external>
          {t("releaseOnGitHub")}
        </MoreLink>
      </div>
    </>
  );

  // The newest release is open; older ones are a disclosure. Ten releases of
  // full notes made this page 18,800px tall - the previous renderer's flat
  // paragraph output meant nothing was scannable, so the length bought nothing.
  if (first) {
    return (
      <li id={anchor(release.version)} className="scroll-mt-24 py-8">
        {head}
        {body}
      </li>
    );
  }

  return (
    <li id={anchor(release.version)} className="scroll-mt-24">
      <details className="group py-6">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[length:var(--text-body)] text-text-primary transition-colors group-hover:text-accent">
            {release.version}
          </span>
          {release.prerelease ? <StatusMarker tone="warning">{t("prerelease")}</StatusMarker> : null}
          {date && release.publishedAt ? (
            <time className="font-mono text-[length:var(--text-micro)] text-text-muted" dateTime={release.publishedAt}>
              {date}
            </time>
          ) : null}
          <span className="ml-auto font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
            {t("showNotes")}
          </span>
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
        {releases.length > 0 ? (
          <>
            <ol className="divide-y divide-line border-t border-line-strong">
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
          <MoreLink href="/docs/releases">{t("howReleasesWork")}</MoreLink>
        </div>
      </Section>
    </>
  );
}
