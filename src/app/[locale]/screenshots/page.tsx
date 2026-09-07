import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { HeroInterface } from "@/components/hero/HeroInterface";
import { BatteryReadout } from "@/components/battery/BatteryReadout";
import { BatteryHealthPanel } from "@/components/battery/BatteryHealthPanel";
import { BatteryPackView } from "@/components/battery/BatteryPackView";
import { ModuleSelectionProvider } from "@/components/battery/selection-context";
import { ScanSimulator } from "@/components/features/ScanSimulator";
import { LiveTelemetryChart } from "@/components/telemetry/LiveTelemetryChart";
import { PlatformExplorer } from "@/components/vehicles/PlatformExplorer";
import { ConnectionDiagram } from "@/components/architecture/ConnectionDiagram";
import { EcuTopology } from "@/components/architecture/EcuTopology";
import { ProtocolStack } from "@/components/architecture/ProtocolStack";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { SessionSimulator } from "@/components/product/SessionSimulator";

/**
 * Capture surface. Every instrument on one page, each in its own framed shot,
 * so screenshots can be taken without the marketing copy around them. Not
 * linked from anywhere and kept out of the sitemap; noindex below.
 */
export const metadata: Metadata = {
  title: "Screenshots",
  robots: { index: false, follow: false },
};

/** Bare instruments: framed in a fixed-width figure. */
const framed: { id: string; label: string; node: React.ReactNode; width?: string }[] = [
  { id: "app-shell", label: "Application shell (hero interface)", node: <HeroInterface />, width: "max-w-[680px]" },
  { id: "battery-readout", label: "Battery health, landing block", node: <BatteryReadout />, width: "max-w-[720px]" },
  { id: "battery-health-panel", label: "Battery health, detail panel", node: <BatteryHealthPanel />, width: "max-w-[520px]" },
  { id: "battery-pack-3d", label: "Battery pack, 3D", node: <BatteryPackView />, width: "max-w-[760px]" },
  { id: "scan-simulator", label: "ECU scan", node: <ScanSimulator />, width: "max-w-[720px]" },
  { id: "scan-simulator-compact", label: "ECU scan, compact", node: <ScanSimulator compact />, width: "max-w-[560px]" },
  { id: "live-telemetry", label: "Live telemetry", node: <LiveTelemetryChart />, width: "max-w-[820px]" },
  { id: "platform-explorer", label: "Platform explorer", node: <PlatformExplorer />, width: "max-w-[900px]" },
];

/** Full sections: rendered exactly as they appear in the site. */
const sections: { id: string; label: string; node: React.ReactNode }[] = [
  { id: "connection-diagram", label: "Connection diagram", node: <ConnectionDiagram /> },
  { id: "session-simulator", label: "Session walkthrough", node: <SessionSimulator /> },
  { id: "battery-matrix", label: "Cell-group matrix", node: <BatteryMatrixSection /> },
  { id: "ecu-topology", label: "ECU topology", node: <EcuTopology /> },
  { id: "protocol-stack", label: "Protocol stack", node: <ProtocolStack /> },
];

export default async function ScreenshotsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ModuleSelectionProvider>
      <Container className="py-xl">
        <h1 className="text-[2rem] tracking-[-0.02em]">Screenshots</h1>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-text-secondary">
          Every instrument on its own, for capture. Not part of the site navigation.
        </p>
      </Container>

      <Container className="space-y-16 pb-4xl">
        {framed.map((f) => (
          <figure key={f.id} id={f.id} className="scroll-mt-24">
            <figcaption className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
              {f.label}
            </figcaption>
            <div className={f.width}>{f.node}</div>
          </figure>
        ))}
      </Container>

      <div className="space-y-4 border-t border-line-strong">
        {sections.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <Container className="pt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                {s.label}
              </p>
            </Container>
            {s.node}
          </div>
        ))}
      </div>
    </ModuleSelectionProvider>
  );
}
