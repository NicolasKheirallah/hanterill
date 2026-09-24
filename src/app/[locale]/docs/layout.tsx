import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { CommandTrigger } from "@/components/command/SiteCommand";
import { getLatestRelease } from "@/lib/github";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, release] = await Promise.all([getTranslations("docs"), getLatestRelease()]);

  return (
    <div className="border-t border-line">
      <Container className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden py-10 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <div className="mb-5">
              <CommandTrigger />
            </div>
            <DocsSidebar />
            <p className="mt-6 border-t border-line pt-3 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
              {t("versionStamp")} {release?.version ?? t("versionUnknown")}
            </p>
          </div>
        </aside>

        <div className="py-8 lg:py-10">
          <div className="mb-6 lg:hidden">
            <CommandTrigger />
            {/* Docs navigation was desktop-only: below `lg` the sidebar is
                hidden and a phone reader could only move through the 19 pages
                one prev/next step at a time. */}
            <details className="mt-3 rounded-sm border border-line bg-surface">
              <summary className="flex min-h-11 cursor-pointer items-center px-3 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-secondary [&::-webkit-details-marker]:hidden">
                {t("allDocs")}
              </summary>
              <div className="max-h-[60vh] overflow-y-auto border-t border-line px-3 py-3">
                <DocsSidebar />
              </div>
            </details>
          </div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            {t("eyebrow")}
          </p>
          {children}
        </div>
      </Container>
    </div>
  );
}
