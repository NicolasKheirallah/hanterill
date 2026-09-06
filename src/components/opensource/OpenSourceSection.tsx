import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { Code } from "@/components/ui/Code";
import { GitHubStats } from "./GitHubStats";
import { site } from "@/lib/site";

const sample = `// Read battery state of health from the BECM over UDS.
let response = uds
    .read_data_by_identifier(Did::BatterySoh) // 0x496D
    .await?;

let soh = decode_battery_soh(response.payload())?;
tracing::info!(soh_percent = soh.percent, "battery state of health");

session.record(Measurement::BatterySoh(soh));`;

export function OpenSourceSection() {
  const t = useTranslations("opensource");
  const stack = [
    ["Rust", t("stackRustDesc")],
    ["Tauri v2", t("stackTauriDesc")],
    ["React + TypeScript", t("stackUiDesc")],
  ];
  return (
    <section className="border-b border-line bg-bg-secondary py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading title={t("title")} lead={t("lead")} />
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {stack.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="font-mono text-[14px] text-text-primary">{k}</dt>
                  <dd className="text-[13px] text-text-secondary sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href={site.repoUrl} external>
                {t("viewRepo")}
              </Button>
              <MoreLink href="/docs/architecture">{t("readArch")}</MoreLink>
            </div>
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="h-[92px] rounded-lg border border-line bg-surface" aria-hidden />
                }
              >
                <GitHubStats />
              </Suspense>
            </div>
          </div>

          <div className="min-w-0 lg:pt-4">
            <Code code={sample} lang="rust" filename="engine/src/battery.rs" />
          </div>
        </div>
      </Container>
    </section>
  );
}
