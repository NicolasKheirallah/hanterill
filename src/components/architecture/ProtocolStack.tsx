import { useTranslations } from "next-intl";
import { Container, SectionHeading } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";

export function ProtocolStack() {
  const t = useTranslations("protocolStack");

  const layers = [
    { name: "Hanterill", note: t("layers.hanterill"), tone: true },
    { name: t("engineName"), note: t("layers.engine") },
    { name: "ISO 14229 UDS", note: t("layers.uds") },
    { name: "ISO 13400 DoIP", note: t("layers.doip") },
    { name: t("transportName"), note: t("layers.transport") },
    { name: t("ethernetName"), note: t("layers.ethernet") },
    { name: t("gatewayName"), note: t("layers.gateway") },
  ];

  const wire = [
    ["UDP 13400", t("wire.udp")],
    ["TCP 13400", t("wire.tcp")],
    [t("wireLabels.routing"), t("wire.routing")],
    [t("wireLabels.sessionControl"), t("wire.session")],
    [t("wireLabels.identifierRead"), t("wire.read")],
    [t("wireLabels.dtcRead"), t("wire.dtc")],
  ];

  return (
    <section className="border-b border-line py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <ol className="overflow-hidden rounded-sm border border-line">
            {layers.map((l) => (
              <Reveal
                as="li"
                key={l.name}
                className={`flex items-baseline justify-between gap-4 border-b border-line px-5 py-4 last:border-0 ${
                  l.tone ? "bg-accent-tint" : "bg-surface"
                }`}
              >
                <span className="font-mono text-[14px] text-text-primary">{l.name}</span>
                <span className="text-right text-[12px] text-text-secondary">{l.note}</span>
              </Reveal>
            ))}
          </ol>

          <div>
            <p className="text-[15px] leading-relaxed text-text-secondary">{t("paragraph")}</p>
            <dl className="mt-6 divide-y divide-line rounded-sm border border-line bg-surface">
              {wire.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="font-mono text-[13px] text-text-primary">{k}</dt>
                  <dd className="text-[12px] text-text-secondary sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
