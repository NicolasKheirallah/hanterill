import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { FeatureBlocks } from "@/components/features/FeatureBlocks";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/features/walkthrough", id: "walkthrough" });
}

export default async function WalkthroughPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LocalizedPageHeader id="walkthrough" />
      <FeatureBlocks />
    </>
  );
}
