import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/layout";
import { ScreenshotGallery, type ShotItem } from "@/components/screenshots/ScreenshotGallery";
import { allShots } from "@/lib/shots";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/screenshots", id: "screenshots" });
}

export default async function ScreenshotsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ts = await getTranslations("shots");
  // One map, shared with the seven feature pages that carry the same captures
  // as figures. It used to be inline here only, which is why the feature pages
  // were text-only while these files sat unused.
  const shots: ShotItem[] = allShots.map((s) => ({
    root: s.root,
    label: ts(s.labelKey),
    href: s.href,
  }));

  return (
    <>
      <LocalizedPageHeader id="screenshots" />
      <Section>
        <ScreenshotGallery shots={shots} />
      </Section>
    </>
  );
}
