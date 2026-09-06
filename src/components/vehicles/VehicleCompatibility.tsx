import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";
import { PlatformExplorer } from "./PlatformExplorer";

export function VehicleCompatibility() {
  const t = useTranslations("platforms");
  return (
    <section id="vehicles" className="scroll-mt-20 border-b border-line py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />
        <div className="mt-10">
          <PlatformExplorer />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="max-w-md text-[13px] leading-relaxed text-text-muted">{t("disclaimer")}</p>
          <MoreLink href="/vehicles">{t("moreLink")}</MoreLink>
        </div>
      </Container>
    </section>
  );
}
