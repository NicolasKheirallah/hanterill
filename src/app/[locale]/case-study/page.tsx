import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { SessionSimulator } from "@/components/product/SessionSimulator";
import { CaseStudy } from "@/components/sections/CaseStudy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/case-study", id: "caseStudy" });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LocalizedPageHeader id="caseStudy" />
      <SessionSimulator />
      <CaseStudy />
    </>
  );
}
