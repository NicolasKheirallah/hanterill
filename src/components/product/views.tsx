import { useTranslations } from "next-intl";
import { Field, Metric } from "./PanelChrome";
import { MiniChart } from "./MiniChart";
import { StatusMarker } from "@/components/ui/StatusBadge";
import {
  batteryDemo,
  cellOffsets,
  demoVehicle,
  dtcDemo,
  dtcStateMeta,
  liveChannels,
  liveTrace,
} from "@/lib/demo-data";
import { ecus, ecuStats } from "@/lib/ecus";
import { cn } from "@/lib/cn";

const toneText: Record<string, string> = {
  error: "text-status-error",
  warning: "text-status-warning",
  info: "text-status-info",
  muted: "text-text-muted",
  ok: "text-status-ok",
};

export function OverviewView() {
  const t = useTranslations("views");
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">{t("vehicle")}</div>
        <div className="mt-1 text-[15px] text-text-primary">{demoVehicle.model}</div>
        <div className="text-[13px] text-text-secondary">{demoVehicle.variant}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Metric label={t("batteryHealth")} value={batteryDemo.soh.toFixed(2)} unit="%" />
        <Metric label={t("cellDelta")} value={String(batteryDemo.cellDelta)} unit="mV" />
        <Metric label={t("packVoltage")} value={batteryDemo.packVoltage.toFixed(1)} unit="V" />
        <Metric label={t("stateOfCharge")} value={String(batteryDemo.soc)} unit="%" />
      </div>
      <div className="border-t border-line pt-3">
        <MiniChart data={liveTrace(60)} min={392} max={404} unit="V" label={t("packVoltage60s")} height={92} live />
      </div>
    </div>
  );
}

export function BatteryView() {
  const t = useTranslations("views");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-6">
        <Field label={t("stateOfHealth")} value={`${batteryDemo.soh.toFixed(2)} %`} />
        <Field label={t("stateOfCharge")} value={`${batteryDemo.soc} %`} />
        <Field label={t("packVoltage")} value={`${batteryDemo.packVoltage.toFixed(1)} V`} />
        <Field label={t("packCurrent")} value={`${batteryDemo.packCurrent.toFixed(1)} A`} />
        <Field label={t("avgCellGroup")} value={`${batteryDemo.avgCellGroup.toFixed(3)} V`} />
        <Field label={t("cellDelta")} value={`${batteryDemo.cellDelta} mV`} />
        <Field label={t("minMax")} value={`${batteryDemo.minCellGroup.toFixed(3)} / ${batteryDemo.maxCellGroup.toFixed(3)} V`} />
        <Field label={t("packTemp")} value={`${batteryDemo.tempMin.toFixed(1)} to ${batteryDemo.tempMax.toFixed(1)} °C`} />
      </div>
      <div>
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
          {t("potentialsCaption")}
        </div>
        <div className="grid grid-cols-[repeat(27,1fr)] gap-[2px]">
          {cellOffsets.map((off, i) => (
            <span
              key={i}
              title={t("moduleGroupTitle", {
                module: Math.floor(i / 4) + 1,
                group: (i % 4) + 1,
                value: `${off >= 0 ? "+" : ""}${off}`,
              })}
              className="aspect-square"
              style={{
                background:
                  Math.abs(off) <= 2
                    ? "var(--line)"
                    : Math.abs(off) <= 4
                      ? "color-mix(in srgb, var(--accent) 45%, var(--line))"
                      : "color-mix(in srgb, var(--status-warning) 60%, var(--line))",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DtcView() {
  const t = useTranslations("views");
  return (
    <ul className="divide-y divide-line">
      {dtcDemo.map((d) => {
        const meta = dtcStateMeta[d.state];
        return (
          <li key={d.code} className="py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] text-text-primary">
                <span className="text-text-muted">{d.ecu}</span> {d.code}
              </span>
              <span className={cn("text-[12px]", toneText[meta.tone])}>{meta.label}</span>
            </div>
            <p className="mt-0.5 text-[13px] text-text-secondary">{d.description}</p>
            <p className="mt-0.5 font-mono text-[11px] text-text-muted">
              {meta.note}
              {d.snapshot ? ` · ${t("snapshotAvailable")}` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function ModulesView() {
  const t = useTranslations("views");
  return (
    <div className="space-y-3">
      <div className="flex gap-6 font-mono text-[12px] text-text-secondary">
        <span>
          <span className="tnum text-text-primary">{ecuStats.discovered}</span> {t("discovered")}
        </span>
        <span>
          <span className="tnum text-text-primary">{ecuStats.diagnostic}</span> {t("diagnosticCapable")}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-6">
        {ecus.slice(0, 14).map((e) => (
          <li key={e.code} className="flex items-center justify-between border-b border-line py-1.5">
            <span className="font-mono text-[12px] text-text-primary">{e.code}</span>
            <StatusMarker tone={e.diagnostic ? "ok" : "muted"}>
              {e.diagnostic ? t("connected") : t("noUds")}
            </StatusMarker>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LiveView() {
  const t = useTranslations("views");
  return (
    <div className="space-y-4">
      <MiniChart data={liveTrace(90)} min={392} max={404} unit="V" label={t("packVoltage")} height={110} live />
      <div className="grid grid-cols-2 gap-x-6">
        {liveChannels.map((c) => (
          <Field key={c.id} label={c.label} value={`${c.value} ${c.unit}`} />
        ))}
      </div>
    </div>
  );
}

export const demoViewMap = {
  overview: OverviewView,
  battery: BatteryView,
  dtc: DtcView,
  modules: ModulesView,
  live: LiveView,
  logs: LogsView,
} as const;

export function LogsView() {
  const lines = [
    "12:04:18.221  DoIP  vehicle identification response  VIN redacted",
    "12:04:18.402  DoIP  routing activation  0x0000 -> accepted",
    "12:04:18.955  UDS   0x10 03  extended session  BECM",
    "12:04:19.140  UDS   0x22 49 6D  read battery SOH",
    "12:04:19.302  UDS   0x19 02  report DTC by status mask  ff",
    "12:04:20.001  UDS   0x22 16 35  read pack voltage",
    "12:04:20.560  export  session-2024-05-17.json  written",
  ];
  return (
    <pre className="overflow-x-auto font-mono text-[11.5px] leading-relaxed text-text-secondary">
      {lines.join("\n")}
    </pre>
  );
}
