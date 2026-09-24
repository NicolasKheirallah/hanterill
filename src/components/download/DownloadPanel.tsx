"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Car, Code, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { platforms, site } from "@/lib/site";
import { detectPlatform } from "@/lib/platform";
import {
  archMatches,
  assetArchLabel,
  assetsForPlatform,
  detectArch,
  formatBytes,
  type Release,
} from "@/lib/github";
import { platformMeta, statusMeta } from "@/lib/vehicles";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

const noop = () => () => {};

export function DownloadPanel({ release }: { release: Release | null }) {
  const detected = useSyncExternalStore(noop, detectPlatform, () => null);
  const t = useTranslations("download");
  const tp = useTranslations("pricing");
  const tpl = useTranslations("platforms");
  const locale = useLocale();
  // Where the browser names a CPU family, the matching build says so. Null
  // (Safari, older Chrome) simply renders no hint and the arch labels alone
  // carry the choice.
  const [arch, setArch] = useState<"arm" | "x86" | null>(null);
  useEffect(() => {
    let live = true;
    detectArch().then((a) => {
      if (live) setArch(a);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="rounded-sm border border-line bg-surface">
      <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-[15px] font-medium text-text-primary">{t("heading")}</span>
        <span className="font-mono text-[12px] text-text-muted">
          {release ? (
            <>
              {release.version}
              {release.publishedAt
                ? ` · ${new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(release.publishedAt))}`
                : ""}
            </>
          ) : (
            t("latestRelease")
          )}
        </span>
      </div>

      <ul className="divide-y divide-line">
        {platforms.map((p) => {
          const builds = release ? assetsForPlatform(release.assets, p.id) : [];
          const isDetected = detected === p.id;
          return (
            <li
              key={p.id}
              className={cn("flex flex-col gap-1 px-5 py-4", isDetected && "bg-accent-tint")}
            >
              <div className="flex items-center gap-2 text-[15px] text-text-primary">
                {p.label}
                <span className="font-mono text-[12px] text-text-muted">{p.note}</span>
                {isDetected ? (
                  <span className="rounded-sm border border-accent/40 px-1.5 py-0.5 font-mono text-[length:var(--text-micro)] uppercase tracking-wider text-accent">
                    {t("detected")}
                  </span>
                ) : null}
              </div>

              {builds.length > 0 ? (
                // One row per released build, labelled with the architecture
                // the filename names - the panel shows what the release ships,
                // never a wish list of platforms.
                <ul>
                  {builds.map((asset) => {
                    const archLabel = assetArchLabel(asset.name, p.id);
                    const likely = arch != null && archMatches(asset.name, arch);
                    return (
                      <li
                        key={asset.name}
                        className="flex flex-col gap-2 border-t border-line py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[14px] font-medium text-text-primary">
                              {archLabel ?? asset.name}
                            </span>
                            {likely ? (
                              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-status-ok">
                                {t("forThisMachine")}
                              </span>
                            ) : null}
                          </div>
                          <div className="font-mono text-[12px] text-text-muted">
                            {asset.name}
                            {asset?.size ? ` · ${formatBytes(asset.size)}` : ""}
                          </div>
                        </div>
                        <a
                          href={asset.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-line-strong px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                        >
                          <Download className="h-4 w-4" strokeWidth={1.75} />
                          {t("downloadFormat", { format: assetFormatOf(asset.name) })}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                // No asset matched (offline, or the release ships nothing for
                // this OS): one honest row pointing at the releases page.
                <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-mono text-[12px] text-text-muted">{p.artifact}</div>
                  <a
                    href={site.releasesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-line-strong px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                  >
                    <Download className="h-4 w-4" strokeWidth={1.75} />
                    {t("releases")}
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* The compatibility decision sits beside the download decision: the
          three platform statuses in plain words, and the route to the per-car
          detail. Status text comes from the platforms catalog so the panel and
          the vehicles page say the same thing. */}
      <div className="border-t border-line px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2 text-[14px] font-medium text-text-primary">
            <Car className="h-4 w-4" strokeWidth={1.75} />
            {t("compatTitle")}
          </span>
          {Object.entries(platformMeta).map(([id, pm]) => (
            <StatusMarker key={id} tone={statusMeta[pm.status].tone}>
              {`${pm.label} · ${tpl(`status.${pm.status}`)}`}
            </StatusMarker>
          ))}
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
          {t("compatBody")}{" "}
          <Link href="/vehicles" className="font-medium text-accent hover:text-accent-hover">
            {t("checkVehicle")}
          </Link>
        </p>
      </div>

      <div className="flex items-start gap-3 border-t border-line px-5 py-4">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-ok" aria-hidden />
        <p className="text-[13.5px] leading-relaxed text-text-secondary">
          <span className="font-medium text-text-primary">{tp("promise")}</span> {tp("detail")}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
        <span className="flex items-center gap-2 font-mono text-[12px] text-text-secondary">
          <Code className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t("sourceLine")}
        </span>
        <a
          href={site.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] font-medium text-accent hover:text-accent-hover"
        >
          {t("viewSourceOnGitHub")}
        </a>
      </div>

      {!release ? (
        <p className="border-t border-line px-5 py-3 text-[12px] text-text-muted">
          {t("unavailable")}
        </p>
      ) : null}
    </div>
  );
}

/** Lowercase extension from an asset name: ".dmg", ".exe", ".deb". */
function assetFormatOf(name: string): string {
  if (/\.tar\.gz$/i.test(name)) return ".tar.gz";
  const m = name.match(/(\.[a-z]+)$/i);
  return m ? m[1].toLowerCase() : "";
}
