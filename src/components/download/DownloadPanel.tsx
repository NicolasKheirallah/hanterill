"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Download, Terminal } from "lucide-react";
import { platforms, site } from "@/lib/site";
import { detectPlatform } from "@/lib/platform";
import { formatBytes, matchAssetForPlatform, type Release } from "@/lib/github";
import { cn } from "@/lib/cn";

const noop = () => () => {};

export function DownloadPanel({ release }: { release: Release | null }) {
  const detected = useSyncExternalStore(noop, detectPlatform, () => null);
  const t = useTranslations("download");

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-[15px] font-medium text-text-primary">{t("heading")}</span>
        <span className="font-mono text-[12px] text-text-muted">
          {release ? (
            <>
              {release.version}
              {release.publishedAt
                ? ` · ${new Date(release.publishedAt).toLocaleDateString("en-CA")}`
                : ""}
            </>
          ) : (
            t("latestRelease")
          )}
        </span>
      </div>

      <ul className="divide-y divide-line">
        {platforms.map((p) => {
          const asset = release ? matchAssetForPlatform(release.assets, p.id) : null;
          const href = asset?.downloadUrl ?? site.releasesUrl;
          const isDetected = detected === p.id;
          return (
            <li
              key={p.id}
              className={cn(
                "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                isDetected && "bg-accent-tint",
              )}
            >
              <div>
                <div className="flex items-center gap-2 text-[15px] text-text-primary">
                  {p.label}
                  {isDetected ? (
                    <span className="rounded-sm border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      {t("detected")}
                    </span>
                  ) : null}
                </div>
                <div className="font-mono text-[12px] text-text-muted">
                  {p.arch} · {asset ? asset.name : p.artifact}
                  {asset?.size ? ` · ${formatBytes(asset.size)}` : ""}
                </div>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-line-strong px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-bg-secondary"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {asset ? t("download") : t("releases")}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
        <span className="flex items-center gap-2 font-mono text-[12px] text-text-secondary">
          <Terminal className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t("buildYourself")}
        </span>
        <a
          href={`${site.repoUrl}#build-from-source`}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] font-medium text-accent hover:text-accent-hover"
        >
          {t("buildFromSource")}
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
