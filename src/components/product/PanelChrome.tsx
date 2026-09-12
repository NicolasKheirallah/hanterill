import { useId, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Battery,
  Cpu,
  Gauge,
  LayoutGrid,
  ScrollText,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusMarker } from "@/components/ui/StatusBadge";

export const panelTabs = [
  { id: "overview", key: "panelOverview", icon: LayoutGrid },
  { id: "battery", key: "panelBattery", icon: Battery },
  { id: "dtc", key: "panelDtc", icon: TriangleAlert },
  { id: "modules", key: "panelModules", icon: Cpu },
  { id: "live", key: "panelLive", icon: Activity },
  { id: "logs", key: "panelLogs", icon: ScrollText },
] as const;

export type PanelTabId = (typeof panelTabs)[number]["id"];

/**
 * The Hanterill application shell, rebuilt as a real component. It is a
 * representative interface for the website, not a screenshot and not a
 * live diagnostic session.
 */
export function PanelChrome({
  active,
  onSelect,
  children,
  connection = "connected",
}: {
  active: PanelTabId;
  onSelect: (id: PanelTabId) => void;
  children: ReactNode;
  connection?: "connected" | "scanning";
}) {
  const t = useTranslations("views");
  const panelId = useId();

  const onTabKeyDown = (e: KeyboardEvent) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (dir === 0) return;
    e.preventDefault();
    const ids = panelTabs.map((tab) => tab.id);
    const next = ids[(ids.indexOf(active) + dir + ids.length) % ids.length];
    onSelect(next);
    const el = document.getElementById(tabBtnId(panelId, next));
    el?.focus();
  };

  return (
    <div className="overflow-hidden rounded-sm border border-line-strong bg-surface [--panel-fg:var(--text-secondary)]">
      <div className="flex items-center justify-between border-b border-line bg-bg-secondary px-3.5 py-2.5">
        <div className="flex items-center gap-2 font-mono text-[12px] text-text-secondary">
          <Gauge className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
          <span className="tracking-tight">Hanterill</span>
        </div>
        <StatusMarker tone={connection === "connected" ? "ok" : "info"} pulse>
          {connection === "connected" ? t("connected") : t("scanningShort")}
        </StatusMarker>
      </div>

      <div className="grid grid-cols-[92px_minmax(0,1fr)] sm:grid-cols-[136px_minmax(0,1fr)]">
        <nav
          className="border-r border-line bg-bg-secondary/60 py-2"
          aria-label={t("panelSectionsAria")}
          role="tablist"
          aria-orientation="vertical"
          onKeyDown={onTabKeyDown}
        >
          {panelTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === active;
            const label = t(tab.key);
            return (
              <button
                key={tab.id}
                id={tabBtnId(panelId, tab.id)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={tabPanelId(panelId)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[12px] transition-colors",
                  isActive
                    ? "border-l-2 border-accent bg-surface text-text-primary"
                    : "border-l-2 border-transparent text-text-muted hover:text-text-secondary",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </button>
            );
          })}
        </nav>

        <div id={tabPanelId(panelId)} role="tabpanel" className="min-w-0 min-h-[340px] p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function tabBtnId(panelId: string, tab: string) {
  return `${panelId.replace(/:/g, "")}-tab-${tab}`;
}
function tabPanelId(panelId: string) {
  return `${panelId.replace(/:/g, "")}-panel`;
}

export function Field({ label, value, mono = true, tone }: { label: string; value: ReactNode; mono?: boolean; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className={cn("tnum text-[13px] text-text-primary", mono && "font-mono", tone)}>{value}</span>
    </div>
  );
}

export function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="tnum mt-1 font-mono text-[18px] text-text-primary">
        {value}
        {unit ? <span className="ml-1 text-[12px] text-text-secondary">{unit}</span> : null}
      </div>
    </div>
  );
}
