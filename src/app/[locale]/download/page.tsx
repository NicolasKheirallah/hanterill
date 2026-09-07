import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { DownloadPanel } from "@/components/download/DownloadPanel";
import { getLatestRelease } from "@/lib/github";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download openCMA for Windows, macOS or Linux, or build it from source. Release details come from GitHub Releases.",
};

async function Panel() {
  const release = await getLatestRelease();
  return <DownloadPanel release={release} />;
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="download" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Suspense fallback={<div className="h-72 rounded-sm border border-line bg-surface" aria-hidden />}>
            <Panel />
          </Suspense>

          <Prose>
            <h2>Build from source</h2>
            <p>
              openCMA is Rust and Tauri v2. With the Rust toolchain and Node installed, clone the
              repository and run the Tauri build for your platform. The full steps are in the
              development guide.
            </p>
            <h2>Verifying a download</h2>
            <p>
              Release assets are published on GitHub with checksums. Match the checksum of your
              download against the one listed on the release page before running it.
            </p>
            <h2>Release cadence</h2>
            <p>
              Versions follow the tags in the repository. The panel shows the latest published
              release and its assets; if GitHub cannot be reached it links to the releases page.
            </p>
          </Prose>
        </div>

        <div className="mt-8 flex flex-wrap gap-6">
          <MoreLink href="/docs/development">Development guide</MoreLink>
          <MoreLink href={site.releasesUrl} external>
            All releases on GitHub
          </MoreLink>
        </div>

        <div className="mt-2xl max-w-[36rem] border-t border-line-strong pt-6">
          <h2 className="font-[family-name:var(--font-display)] text-[1.375rem] text-text-primary">
            License
          </h2>
          <p className="mt-2 text-[15px] font-medium text-text-primary">{site.license.short}</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">{site.license.line}</p>
          <div className="mt-4">
            <MoreLink href="/docs/license">Read license terms</MoreLink>
          </div>
        </div>
      </Container>
    </>
  );
}
