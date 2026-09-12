import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { Container, MoreLink, SectionHeading } from "@/components/ui/layout";
import { ScanSimulator } from "./ScanSimulator";
import { LiveTelemetryChart } from "@/components/telemetry/LiveTelemetryChart";
import { BatteryReadout } from "@/components/battery/BatteryReadout";
import { evidenceDemo } from "@/lib/demo-data";
import { cn } from "@/lib/cn";

/**
 * Workbench section. Each entry is an instrument in a hairline-framed figure
 * with a short "what you do with it" line; the marketing copy is the minority.
 * The layout alternates between a text/instrument split and a full-width stack
 * so the section never runs more than two splits in a row.
 */
function Entry({
  title,
  body,
  cta,
  caption,
  visual,
  reverse,
  layout = "split",
}: {
  title: string;
  body: string;
  cta?: ReactNode;
  caption: string;
  visual: ReactNode;
  reverse?: boolean;
  layout?: "split" | "stack";
}) {
  if (layout === "stack") {
    return (
      <div className="border-t border-line py-12 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[38ch]">
            <h3 className="font-[family-name:var(--font-display)] text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-text-primary">
              {title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{body}</p>
          </div>
          {cta ? <div className="shrink-0">{cta}</div> : null}
        </div>
        <figure className="m-0 mt-8">{visual}</figure>
      </div>
    );
  }

  return (
    <div className="grid gap-6 border-t border-line py-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
      <div className={cn("lg:col-span-4", reverse && "lg:order-2")}>
        <h3 className="font-[family-name:var(--font-display)] text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-text-primary">
          {title}
        </h3>
        <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-text-secondary">{body}</p>
        {cta ? <div className="mt-4">{cta}</div> : null}
      </div>
      <figure className={cn("m-0 lg:col-span-8", reverse && "lg:order-1")}>
        {visual}
        <figcaption className="mt-3 border-t border-line pt-2 font-mono text-[11px] text-text-muted">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
}

function DtcRecord() {
  const t = useTranslations("features");
  const td = useTranslations("demo");
  const rows = [
    { ecu: "BECM", code: "P0A80-00", state: t("dtcStored"), note: t("dtcSnapshot"), tone: "text-status-info" },
    { ecu: "CCM", code: "B1B25-13", state: t("dtcActive"), note: t("dtcPresent"), tone: "text-status-error" },
    { ecu: "TCAM", code: "U3003-16", state: t("dtcPending"), note: t("dtcSeenOnce"), tone: "text-status-warning" },
    { ecu: "BECM", code: "P1AF0-71", state: t("dtcHistorical"), note: t("dtcRetained"), tone: "text-text-muted" },
  ];
  return (
    <div className="border border-line bg-surface">
      <ul className="divide-y divide-line">
        {rows.map((d) => (
          <li key={d.code} className="grid gap-1 p-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <div className="font-mono text-[13px] text-text-primary">
              <span className="text-text-muted">{d.ecu}</span> {d.code}
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">{td(`faultTitles.${d.code}`)}</p>
              <p className={cn("mt-1 font-mono text-[11px]", d.tone)}>
                {d.state} · {d.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
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
    <div className="border border-line bg-surface p-6">
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
    <div className="grid grid-cols-2">
      {cols.map((c, i) => (
        <div key={c.label} className={cn("border border-line bg-surface p-5", i === 1 && "border-l-0")}>
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
  );
}

function ReportScore() {
  const t = useTranslations("features");
  const rows = t.raw("scoreRows") as [string, string, "ok" | "watch"][];
  return (
    <div className="border border-line bg-surface">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("scoreLabel")}</div>
          <div className="tnum mt-1 font-mono text-[2.4rem] leading-none text-text-primary">91<span className="text-[1.1rem] text-text-muted">/100</span></div>
        </div>
        <div className="rounded-sm border border-status-warning/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-status-warning">{t("advisoriesTag")}</div>
      </div>
      <ul className="divide-y divide-line">
        {rows.map(([label, note, tone]) => (
          <li key={label} className="flex items-baseline justify-between gap-4 px-5 py-2.5">
            <span className="text-[14px] text-text-primary">{label}</span>
            <span className={cn("font-mono text-[12px]", tone === "ok" ? "text-status-info" : "text-status-warning")}>
              {note}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-5 py-2.5 font-mono text-[11px] text-text-muted">
        {t("rulesNote")}
      </p>
    </div>
  );
}

function SystemsList() {
  const t = useTranslations("features");
  const rows = t.raw("systemRows") as string[][];
  return (
    <div className="border border-line bg-surface">
      <ul className="divide-y divide-line">
        {rows.map(([sys, sub]) => (
          <li key={sys} className="grid gap-0.5 px-5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <span className="text-[14px] text-text-primary">{sys}</span>
            <span className="font-mono text-[12px] text-text-secondary">{sub}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShellCard() {
  const t = useTranslations("features");
  const items = t.raw("paletteItems") as string[];
  return (
    <div className="border border-line bg-surface p-6">
      <div className="rounded-sm border border-line-strong bg-bg-primary px-4 py-3">
        <div className="font-mono text-[12px] text-text-muted">{t("paletteKbd")}</div>
        <ul className="mt-2 divide-y divide-line font-mono text-[12px]">
          {items.map((item, i) => (
            <li key={item} className={cn("py-1.5", i === 0 ? "text-text-primary" : "text-text-secondary")}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <dl className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("shellThemesLabel")}</dt>
          <dd className="text-[14px] text-text-primary">{t("shellThemes")}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("shellDensityLabel")}</dt>
          <dd className="text-[14px] text-text-primary">{t("shellDensity")}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{t("shellLanguagesLabel")}</dt>
          <dd className="text-[14px] text-text-primary">{t("shellLanguages")}</dd>
        </div>
      </dl>
    </div>
  );
}

export function FeatureBlocks() {
  const t = useTranslations("features");
  return (
    <section id="features" className="scroll-mt-24 border-b border-line-strong py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10">
          <Entry
            title={t("batteryTitle")}
            body={t("batteryBody")}
            cta={<MoreLink href="/features/battery-health">{t("batteryCta")}</MoreLink>}
            caption={t("sohLabel")}
            visual={<BatteryReadout />}
          />
          <Entry
            reverse
            title={t("scanTitle")}
            body={t("scanBody")}
            cta={<MoreLink href="/features/vehicle-diagnostics">{t("scanCta")}</MoreLink>}
            caption={t("scanCta")}
            visual={<ScanSimulator compact />}
          />
          <Entry
            layout="stack"
            title={t("faultTitle")}
            body={t("faultBody")}
            caption={t("faultTitle")}
            visual={<DtcRecord />}
          />
          <Entry
            reverse
            title={t("liveTitle")}
            body={t("liveBody")}
            cta={<MoreLink href="/features/live-data">{t("liveCta")}</MoreLink>}
            caption={t("liveCta")}
            visual={<LiveTelemetryChart />}
          />
          <Entry
            title={t("serviceTitle")}
            body={t("serviceBody")}
            cta={<MoreLink href="/features/service-functions">{t("serviceCta")}</MoreLink>}
            caption={t("writeAccess")}
            visual={<ServiceRoutines />}
          />
          <Entry
            layout="stack"
            title={t("reportsTitle")}
            body={t("reportsBody")}
            cta={<MoreLink href="/features/inspection-reports">{t("reportsCta")}</MoreLink>}
            caption={t("reportsCaption")}
            visual={<ReportScore />}
          />
          <Entry
            reverse
            title={t("evidenceTitle")}
            body={t("evidenceBody")}
            cta={<MoreLink href="/features/sessions-and-evidence">{t("evidenceCta")}</MoreLink>}
            caption={t("totalDtcs")}
            visual={<EvidenceCompare />}
          />
          <Entry
            layout="stack"
            title={t("systemsTitle")}
            body={t("systemsBody")}
            cta={<MoreLink href="/features/system-telemetry">{t("systemsCta")}</MoreLink>}
            caption={t("systemsCaption")}
            visual={<SystemsList />}
          />
          <Entry
            title={t("shellTitle")}
            body={t("shellBody")}
            caption={t("shellCaption")}
            visual={<ShellCard />}
          />
        </div>
      </Container>
    </section>
  );
}
