import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Container, MoreLink } from "@/components/ui/layout";

const absentKeys = ["cloud", "account", "analytics", "telemetry", "upload"] as const;

export function PrivacySection() {
  const t = useTranslations("privacy");
  return (
    <section className="border-b border-line py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-text-secondary">{t("lead")}</p>
            <div className="mt-6">
              <MoreLink href="/privacy">{t("moreLink")}</MoreLink>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-4 font-mono text-[13px] text-text-primary">
              <span className="rounded-sm border border-line-strong bg-bg-secondary px-3 py-2">
                {t("vehicle")}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line-strong" />
              <span className="rounded-sm border border-line-strong bg-bg-secondary px-3 py-2">
                {t("computer")}
              </span>
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
