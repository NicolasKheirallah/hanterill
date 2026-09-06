import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { Container, MoreLink } from "@/components/ui/layout";
import { ScanSimulator } from "./ScanSimulator";
import { LiveTelemetryChart } from "@/components/telemetry/LiveTelemetryChart";
import { batteryDemo, cellOffsets, evidenceDemo } from "@/lib/demo-data";
import { cn } from "@/lib/cn";

function BlockHeader({ index, title, body, cta }: { index: string; title: string; body: string; cta?: ReactNode }) {
  return (
    <div className="max-w-md">
      <span className="font-mono text-[12px] text-text-muted">{index}</span>
      <h3 className="mt-2 text-2xl font-medium tracking-tight sm:text-[1.75rem]">{title}</h3>
      <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">{body}</p>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}

function Split({ reverse, text, visual }: { reverse?: boolean; text: ReactNode; visual: ReactNode }) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 border-b border-line py-14 lg:grid-cols-2 lg:gap-16 lg:py-20",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
    >
      {text}
      <div>{visual}</div>
    </div>
  );
}

function BatteryReadout() {
  const t = useTranslations("features");
  const heat = cellOffsets;
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="tnum font-mono text-[2.5rem] leading-none text-text-primary">
        {batteryDemo.soh.toFixed(2)}
        <span className="ml-1 text-lg text-text-secondary">%</span>
      </div>
      <div className="mt-1 text-[13px] text-text-secondary">{t("sohLabel")}</div>

      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-4 font-mono text-[12px]">
        {[
          ["Min", `${batteryDemo.minCellGroup.toFixed(3)} V`],
          ["Max", `${batteryDemo.maxCellGroup.toFixed(3)} V`],
          ["Delta", `${batteryDemo.cellDelta} mV`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="uppercase tracking-wider text-text-muted">{k}</dt>
            <dd className="tnum mt-1 text-text-primary">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
          {t("spreadLabel")}
        </div>
        <div className="flex h-8 gap-px overflow-hidden rounded-sm">
          {heat.map((off, i) => (
            <span
              key={i}
              className="flex-1"
              style={{
                background:
                  Math.abs(off) <= 2
                    ? "var(--line)"
                    : Math.abs(off) <= 4
                      ? "color-mix(in srgb, var(--accent) 40%, var(--line))"
                      : "color-mix(in srgb, var(--status-warning) 55%, var(--line))",
              }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-text-muted">
          <span>{t("spreadWithin")}</span>
          <span>{t("spreadMid")}</span>
          <span>{t("spreadOver")}</span>
        </div>
      </div>
    </div>
  );
}

function DtcRecord() {
  const t = useTranslations("features");
  const rows = [
    { ecu: "BECM", code: "P0A80-00", desc: "Replace hybrid/EV battery pack", state: t("dtcStored"), note: t("dtcSnapshot"), tone: "text-status-info" },
    { ecu: "CCM", code: "B1B25-13", desc: "Evaporator temperature sensor, circuit open", state: t("dtcActive"), note: t("dtcPresent"), tone: "text-status-error" },
    { ecu: "TCAM", code: "U3003-16", desc: "Battery voltage below threshold", state: t("dtcPending"), note: t("dtcSeenOnce"), tone: "text-status-warning" },
    { ecu: "BECM", code: "P1AF0-71", desc: "Cell balancing performance", state: t("dtcHistorical"), note: t("dtcRetained"), tone: "text-text-muted" },
  ];
  return (
    <div className="grid items-start gap-6 border-b border-line py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:py-20">
      <BlockHeader index="03" title={t("faultTitle")} body={t("faultBody")} />
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((d) => (
          <div key={d.code} className="rounded-md border border-line bg-surface p-4">
            <div className="font-mono text-[13px] text-text-primary">
              <span className="text-text-muted">{d.ecu}</span> {d.code}
            </div>
            <p className="mt-1 text-[13px] text-text-secondary">{d.desc}</p>
            <p className={cn("mt-2 font-mono text-[11px]", d.tone)}>
              {d.state} · {d.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceRoutines() {
  const t = useTranslations("features");
  const routines = [
    [t("routineEpb"), t("routineEpbAction")],
    [t("routine12v"), t("routine12vAction")],
    [t("routineClimate"), t("routineClimateAction")],
    [t("routineSunroof"), t("routineSunroofAction")],
  ];
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="inline-flex items-center gap-2 rounded-sm border border-status-warning/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-status-warning">
        <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
        {t("writeAccess")}
      </div>
      <ul className="mt-4 divide-y divide-line">
        {routines.map(([a, b]) => (
          <li key={a} className="flex items-baseline justify-between py-2.5">
            <span className="text-[14px] text-text-primary">{a}</span>
            <span className="font-mono text-[12px] text-text-secondary">{b}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] leading-relaxed text-text-secondary">{t("readOnlyNote")}</p>
    </div>
  );
}

function EvidenceCompare() {
  const t = useTranslations("features");
  const cols = [
    { label: t("beforeRepair"), d: evidenceDemo.before },
    { label: t("afterRepair"), d: evidenceDemo.after },
  ];
  return (
    <div className="grid items-start gap-6 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:py-20">
      <BlockHeader
        index="06"
        title={t("evidenceTitle")}
        body={t("evidenceBody")}
        cta={<MoreLink href="/features/vehicle-diagnostics">{t("evidenceCta")}</MoreLink>}
      />
      <div className="grid grid-cols-2 gap-4">
        {cols.map((c) => (
          <div key={c.label} className="rounded-md border border-line bg-surface p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{c.label}</div>
            <div className="tnum mt-3 font-mono text-[2rem] leading-none text-text-primary">{c.d.total}</div>
            <div className="text-[12px] text-text-secondary">{t("totalDtcs")}</div>
            <dl className="mt-4 space-y-1 border-t border-line pt-3 font-mono text-[12px]">
              <div className="flex justify-between">
                <dt className="text-text-secondary">active</dt>
                <dd className="tnum text-text-primary">{c.d.active}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">historical</dt>
                <dd className="tnum text-text-primary">{c.d.historical}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureBlocks() {
  const t = useTranslations("features");
  return (
    <section id="features" className="scroll-mt-20 border-b border-line py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-text-secondary">{t("lead")}</p>
        </div>

        <div className="mt-6">
          <Split
            text={
              <BlockHeader
                index="01"
                title={t("batteryTitle")}
                body={t("batteryBody")}
                cta={<MoreLink href="/features/battery-health">{t("batteryCta")}</MoreLink>}
              />
            }
            visual={<BatteryReadout />}
          />
          <Split
            reverse
            text={
              <BlockHeader
                index="02"
                title={t("scanTitle")}
                body={t("scanBody")}
                cta={<MoreLink href="/features/vehicle-diagnostics">{t("scanCta")}</MoreLink>}
              />
            }
            visual={<ScanSimulator compact />}
          />
          <DtcRecord />
          <Split
            text={
              <BlockHeader
                index="04"
                title={t("liveTitle")}
                body={t("liveBody")}
                cta={<MoreLink href="/features/live-data">{t("liveCta")}</MoreLink>}
              />
            }
            visual={<LiveTelemetryChart />}
          />
          <Split
            reverse
            text={
              <BlockHeader
                index="05"
                title={t("serviceTitle")}
                body={t("serviceBody")}
                cta={<MoreLink href="/features/service-functions">{t("serviceCta")}</MoreLink>}
              />
            }
            visual={<ServiceRoutines />}
          />
          <EvidenceCompare />
        </div>
      </Container>
    </section>
  );
}
