import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Container, SectionHeading } from "@/components/ui/layout";
import { getLatestRelease } from "@/lib/github";
import { DownloadPanel } from "./DownloadPanel";

async function PanelWithRelease() {
  const release = await getLatestRelease();
  return <DownloadPanel release={release} />;
}

export function DownloadSection() {
  const t = useTranslations("download");
  return (
    <section id="download" className="scroll-mt-24 border-b border-line py-2xl lg:py-3xl">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading title={t("title")} lead={t("lead")} />
          <Suspense
            fallback={<div className="h-72 rounded-sm border border-line bg-surface" aria-hidden />}
          >
            <PanelWithRelease />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
