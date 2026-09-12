"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Download, RotateCcw } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { MiniChart } from "@/components/product/MiniChart";
import { BatteryView } from "@/components/product/views";
import { DUR, EASE } from "@/lib/motion";
import { batteryDemo, liveTrace } from "@/lib/demo-data";
import { simEcus } from "@/lib/scan-sim";
import {
  identify,
  inspectFault,
  report,
  reportCsv,
  reportJson,
  sessionStages,
  type SessionStageId,
} from "@/lib/session-sim";
import { cn } from "@/lib/cn";

export function SessionSimulator() {
  const reduce = useReducedMotion();
  const ts = useTranslations("session");
  const [i, setI] = useState(0);
  const regionRef = useRef<HTMLDivElement>(null);
  const stage = sessionStages[i];

  const go = useCallback((next: number) => {
    setI(Math.max(0, Math.min(sessionStages.length - 1, next)));
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(i - 1);
    }
  }

  return (
    <section
      id="session"
      className="scroll-mt-24 border-y border-line bg-bg-secondary py-2xl lg:py-3xl"
    >
      <Container>
        <SectionHeading title={ts("title")} lead={ts("lead")} />

        {/* Timeline */}
        <ol
          className="mt-10 flex gap-1 overflow-x-auto pb-1 font-mono text-[12px]"
          aria-label={ts("stagesAria")}
        >
          {sessionStages.map((s, idx) => {
            const done = idx < i;
            const current = idx === i;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  onClick={() => go(idx)}
                  className={cn(
                    "flex items-center gap-2 rounded-sm border px-3 py-2 transition-colors",
                    current
                      ? "border-line-strong bg-surface text-text-primary"
                      : "border-transparent text-text-muted hover:text-text-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "tnum",
                      current ? "text-accent" : done ? "text-text-secondary" : "text-text-muted",
                    )}
                  >
                    {s.n}
                  </span>
                  {ts(`stages.${s.id}`)}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Stage panel */}
        <div
          ref={regionRef}
          role="group"
          aria-roledescription={ts("walkthroughAria")}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="mt-4 rounded-sm border border-line bg-surface outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
            <span>{ts("label")}</span>
            <span>
              {stage.n} / {sessionStages[sessionStages.length - 1].n}
            </span>
          </div>

          <div className="min-h-[320px] p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: DUR.base, ease: EASE.standard }}
              >
                <StagePanel id={stage.id} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 font-mono text-[12px]">
            <button
              type="button"
              onClick={() => go(i - 1)}
              disabled={i === 0}
              className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line px-2.5 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              {ts("previous")}
            </button>
            {i === sessionStages.length - 1 ? (
              <button
                type="button"
                onClick={() => go(0)}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line px-2.5 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                {ts("replay")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go(i + 1)}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line-strong bg-text-primary px-2.5 text-bg-primary transition-opacity hover:opacity-90"
              >
                {ts("next")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 font-mono text-[13px] last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className={cn("tnum text-text-primary", tone)}>{value}</span>
    </div>
  );
}

function StagePanel({ id }: { id: SessionStageId }) {
  if (id === "connect") return <ConnectStage />;
  if (id === "identify") return <IdentifyStage />;
  if (id === "scan") return <ScanStage />;
  if (id === "inspect") return <InspectStage />;
  if (id === "battery") return <BatteryView />;
  if (id === "live") return <LiveStage />;
  return <ReportStage />;
}

function ConnectStage() {
  const reduce = useReducedMotion();
  const ts = useTranslations("session");
  const rows = [
    [ts("connectLink"), ts("connectStateLinked")],
    [ts("connectGateway"), ts("connectStateDetected")],
    [ts("connectRouting"), ts("connectStateAccepted")],
  ];
  return (
    <div className="space-y-4">
      {rows.map(([label, state], idx) => (
        <motion.div
          key={label}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduce ? 0 : idx * 0.25, duration: DUR.base, ease: EASE.out }}
          className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
        >
          <span className="font-mono text-[13px] text-text-secondary">{label}</span>
          <StatusMarker tone="ok" pulse={idx === 2}>
            {state}
          </StatusMarker>
        </motion.div>
      ))}
      <p className="pt-2 text-[13px] leading-relaxed text-text-secondary">{ts("connectNote")}</p>
    </div>
  );
}

function IdentifyStage() {
  const ts = useTranslations("session");
  const td = useTranslations("demo");
  return (
    <dl>
      <Row label={ts("idVehicle")} value={identify.model} />
      <Row label={ts("idPlatform")} value={identify.platform} />
      <Row label={ts("idPowertrain")} value={td(identify.powertrainKey)} />
      <Row label={ts("idModelYear")} value={identify.modelYear} />
      <Row label={ts("idVin")} value={<span className="text-text-muted">{identify.vin}</span>} />
      <p className="pt-3 font-mono text-[11px] text-text-muted">{ts("vinNote")}</p>
    </dl>
  );
}

function ScanStage() {
  const ts = useTranslations("session");
  // The walkthrough shows the first ten ECUs of the same simulated scan the
  // landing page runs; totals still come from the full catalogue.
  const rows = simEcus.slice(0, 10);
  return (
    <div>
      <div className="mb-2 flex gap-6 font-mono text-[12px] text-text-secondary">
        <span>
          <span className="tnum text-text-primary">{report.ecusDiscovered}</span> {ts("scanEcus")}
        </span>
        <span>
          <span className="tnum text-text-primary">{rows.filter((e) => e.faults.length).length}</span>{" "}
          {ts("scanWithFaults")}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-6">
        {rows.map((e) => (
          <li key={e.code} className="flex items-center justify-between border-b border-line py-1.5">
            <span className="font-mono text-[12px] text-text-primary">{e.code}</span>
            {e.faults.length ? (
              <span className="font-mono text-[11px] text-status-warning">
                {ts("scanFault", { n: e.faults.length })}
              </span>
            ) : (
              <StatusMarker tone="ok">{ts("scanReady")}</StatusMarker>
            )}
          </li>
        ))}
      </ul>
      <p className="pt-3 font-mono text-[11px] text-text-muted">{ts("scanShortened")}</p>
    </div>
  );
}

function InspectStage() {
  const ts = useTranslations("session");
  const td = useTranslations("demo");
  return (
    <div>
      <div className="font-mono text-[13px] text-text-primary">
        <span className="text-text-muted">{inspectFault.ecu}</span> {inspectFault.code}
      </div>
      <p className="mt-1 text-[14px] text-text-secondary">{td(`faultTitles.${inspectFault.code}`)}</p>
      <dl className="mt-4">
        <Row label={ts("inspectStatus")} value={td(inspectFault.stateKey)} tone="text-status-info" />
        <Row label={ts("inspectControlModule")} value={inspectFault.ecu} />
        <Row label={ts("inspectSnapshot")} value={td(inspectFault.snapshotKey)} />
        <Row label={ts("inspectTimestamp")} value={td(inspectFault.timestampKey)} />
      </dl>
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        {td(`faultDetails.${inspectFault.code}`)}
      </p>
    </div>
  );
}

function LiveStage() {
  const ts = useTranslations("session");
  const tr = useTranslations("common");
  return (
    <div className="space-y-4">
      <MiniChart data={liveTrace(100)} min={392} max={404} unit="V" label={ts("liveVoltage")} height={130} live />
      <div className="grid grid-cols-2 gap-x-6">
        <Row label={ts("liveVoltage")} value={`${batteryDemo.packVoltage.toFixed(1)} V`} />
        <Row label={ts("liveCurrent")} value={`${batteryDemo.packCurrent.toFixed(1)} A`} />
        <Row
          label={ts("liveBatteryTemp")}
          value={`${batteryDemo.tempMin.toFixed(1)} ${tr("rangeTo")} ${batteryDemo.tempMax.toFixed(1)} °C`}
        />
        <Row label={ts("liveLvSystem")} value="14.2 V" />
      </div>
    </div>
  );
}

function ReportStage() {
  const trep = useTranslations("session.report");

  function download(kind: "csv" | "json") {
    const body = kind === "csv" ? reportCsv() : reportJson();
    const blob = new Blob([body], { type: kind === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanterill-example-report.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[13px] uppercase tracking-wider text-text-primary">
          {trep("title")}
        </h3>
        <span className="rounded-sm border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {trep("exampleTag")}
        </span>
      </div>
      <dl className="mt-4">
        <Row label={trep("ecusDiscovered")} value={<AnimatedNumber value={report.ecusDiscovered} />} />
        <Row label={trep("modulesWithFaults")} value={<AnimatedNumber value={report.modulesWithFaults} />} />
        <Row label={trep("activeFaults")} value={<AnimatedNumber value={report.activeFaults} />} />
        <Row label={trep("storedFaults")} value={<AnimatedNumber value={report.storedFaults} />} />
        <Row
          label={trep("batteryHealth")}
          value={
            <>
              <AnimatedNumber value={report.batteryHealth} decimals={2} /> %
            </>
          }
        />
        <Row label={trep("cellDelta")} value={<><AnimatedNumber value={report.cellDelta} /> mV</>} />
      </dl>
      <div className="mt-5 flex gap-2">
        {(["csv", "json"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => download(kind)}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-line-strong px-3 font-mono text-[12px] text-text-primary transition-colors hover:bg-bg-secondary"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            {kind.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
