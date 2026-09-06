import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";

const readOnlyKeys = ["battery", "ecuId", "faultCodes", "telemetry", "export"] as const;
const writeKeys = ["clear", "routines", "adaptations", "udsWrite"] as const;

export function SafetySection() {
  const t = useTranslations("safety");
  return (
    <section id="safety" className="scroll-mt-20 border-b border-line bg-bg-secondary py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-status-ok">{t("readOnly")}</h3>
            <ul className="mt-4 space-y-2">
              {readOnlyKeys.map((k) => (
                <li key={k} className="text-[14px] text-text-secondary">
                  {t(`readOnlyItems.${k}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-status-warning/40 bg-surface p-6">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-status-warning">
              {t("changesVehicle")}
            </h3>
            <ul className="mt-4 space-y-2">
              {writeKeys.map((k) => (
                <li key={k} className="text-[14px] text-text-secondary">
                  {t(`writeItems.${k}`)}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-status-warning">
              {t("writeAccess")}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-line bg-surface p-6">
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
