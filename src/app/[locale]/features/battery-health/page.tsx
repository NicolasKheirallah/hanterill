import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { BatteryMatrixSection } from "@/components/battery/BatteryMatrixSection";
import { BatteryHealthPanel } from "@/components/battery/BatteryHealthPanel";
import { BatteryPackView } from "@/components/battery/BatteryPackView";
import { ModuleSelectionProvider } from "@/components/battery/selection-context";

export const metadata: Metadata = {
  title: "Battery health",
  description:
    "Read state of health and charge, pack voltage, per-cell-group potentials, imbalance and thermal data reported by the vehicle battery management system.",
};

export default async function BatteryHealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ModuleSelectionProvider>
      <LocalizedPageHeader id="batteryHealth" />

      <Container className="py-14 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <BatteryHealthPanel />
          <Prose>
            <h2>Where the number comes from</h2>
            <p>
              State of health is reported by the battery management system, not calculated by openCMA
              from a guess. openCMA reads it, and the values behind it, directly from the vehicle.
            </p>
            <h2>What openCMA reads</h2>
            <ul>
              <li>State of health and state of charge</li>
              <li>Pack voltage and pack current</li>
              <li>All 108 cell-group potentials on CMA (27 modules, 4 groups each)</li>
              <li>Minimum, maximum and delta across cell groups</li>
              <li>Pack and module temperatures</li>
              <li>Estimated usable capacity against nominal</li>
            </ul>
            <p>
              Switch the panel to <strong>Engineering</strong> for the control module, transport,
              service and identifiers. <Link href="/docs/battery-diagnostics">Battery diagnostics docs</Link>{" "}
              have the full read sequence.
            </p>
          </Prose>
        </div>

        <div className="mt-12">
          <BatteryPackView />
        </div>

        <div className="mt-8">
          <MoreLink href="/docs/battery-diagnostics">How state of health is read</MoreLink>
        </div>
      </Container>

      <BatteryMatrixSection />
    </ModuleSelectionProvider>
  );
}
