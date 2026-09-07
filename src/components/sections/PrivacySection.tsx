import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Container, MoreLink, SectionHeading } from "@/components/ui/layout";

const absentKeys = ["cloud", "account", "analytics", "telemetry", "upload"] as const;

export function PrivacySection() {
  const t = useTranslations("privacy");
  return (
    <section className="border-b border-line py-2xl lg:py-3xl">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading title={t("title")} lead={t("lead")} />
            <div className="mt-6">
              <MoreLink href="/privacy">{t("moreLink")}</MoreLink>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <div className="flex items-center gap-4 font-mono text-[13px] text-text-primary">
              <span className="border border-line-strong px-3 py-2">{t("vehicle")}</span>
              <span aria-hidden className="h-px flex-1 bg-line-strong" />
              <span className="border border-line-strong px-3 py-2">{t("computer")}</span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-text-muted">{t("directLink")}</p>

            <ul className="mt-6 space-y-2 border-t border-line pt-5">
              {absentKeys.map((k) => (
                <li key={k} className="flex items-center gap-2.5 font-mono text-[13px] text-text-muted">
                  <X className="h-3.5 w-3.5 text-status-error" strokeWidth={2} />
                  <span className="line-through decoration-line-strong">{t(`absent.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
