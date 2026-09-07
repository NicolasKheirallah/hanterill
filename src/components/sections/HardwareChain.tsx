import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";

const chainKeys = ["obd", "enet", "rj45", "usb", "laptop"] as const;
const notWantedKeys = ["elm", "j2534", "bluetooth", "driver"] as const;

export function HardwareChain() {
  const t = useTranslations("hardware");
  return (
    <section className="border-b border-line bg-bg-secondary py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <ol className="overflow-hidden rounded-sm border border-line">
            {chainKeys.map((c, i) => (
              <li
                key={c}
                className="flex items-center gap-4 border-b border-line bg-surface px-5 py-4 last:border-0"
              >
                <span className="tnum w-6 font-mono text-[12px] text-text-muted">{i + 1}</span>
                <span className="text-[15px] text-text-primary">{t(`chain.${c}`)}</span>
              </li>
            ))}
          </ol>

          <div>
            <ul className="space-y-2.5">
              {notWantedKeys.map((n) => (
                <li key={n} className="text-[14px] leading-relaxed text-text-secondary">
                  {t(`notWanted.${n}`)}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <MoreLink href="/docs/connection">{t("connectionGuide")}</MoreLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
