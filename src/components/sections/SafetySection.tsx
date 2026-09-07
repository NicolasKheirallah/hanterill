import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";

const readOnlyKeys = ["battery", "ecuId", "faultCodes", "telemetry", "export"] as const;
const writeKeys = ["clear", "routines", "adaptations", "udsWrite"] as const;

export function SafetySection() {
  const t = useTranslations("safety");
  return (
    <section id="safety" className="scroll-mt-24 border-b border-line bg-bg-secondary py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid gap-x-14 gap-y-10 sm:grid-cols-2">
          <div className="border-t-2 border-status-ok pt-4">
            <h3 className="font-[family-name:var(--font-display)] text-[1.25rem] text-text-primary">
              {t("readOnly")}
            </h3>
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {readOnlyKeys.map((k) => (
                <li key={k} className="py-2.5 text-[14px] text-text-secondary">
                  {t(`readOnlyItems.${k}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t-2 border-status-warning pt-4">
            <h3 className="font-[family-name:var(--font-display)] text-[1.25rem] text-text-primary">
              {t("changesVehicle")}
            </h3>
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {writeKeys.map((k) => (
                <li key={k} className="py-2.5 text-[14px] text-text-secondary">
                  {t(`writeItems.${k}`)}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-status-warning">
              {t("writeAccess")}
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-[68ch] border-l-2 border-line-strong pl-4">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">{t("highVoltageTitle")}</span>{" "}
            {t("highVoltageBody")}
          </p>
          <div className="mt-4">
            <MoreLink href="/safety">{t("safetyDocs")}</MoreLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
