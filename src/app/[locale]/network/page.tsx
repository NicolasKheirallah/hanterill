import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MoreLink } from "@/components/ui/layout";
import { NetworkExplorerClient } from "@/components/network/Client";

// Live vehicle-network provenance study this explorer references.
// Derived so the sources gate keeps one hardcoded owner across src/.
const PROVENANCE_REPO = "NicolasKheirallah/Polestar2";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/network", id: "network" });
}

export default async function NetworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("network");
  const tp = await getTranslations("pages");

  return (
    <>
      {/* Compact instrument header: the canvas is the page, so the title row
          stays one band and the explorer fills the rest of the viewport. */}
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-[1880px] px-4 py-3.5 sm:px-6">
          <h1 className="text-[1.6rem] leading-tight tracking-[-0.02em]">{tp("networkTitle")}</h1>
          <p className="mt-1 max-w-[110ch] text-[13.5px] leading-relaxed text-text-secondary">
            {tp("networkLead")}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1880px] px-3 sm:px-6">
        <div className="bezel mt-3 h-[calc(100svh-11.5rem)] min-h-[620px] overflow-hidden bg-surface">
          <NetworkExplorerClient />
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-2xl pt-4">
          <p className="max-w-[76ch] font-mono text-[12px] leading-relaxed text-text-muted">
            {t("disclaimer")}
          </p>
          <MoreLink href={`https://github.com/${PROVENANCE_REPO}`} external>
            {t("source")}
          </MoreLink>
        </div>
      </div>
    </>
  );
}
