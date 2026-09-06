import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Battery health, full vehicle diagnostics, live telemetry and gated service functions, all over one direct DoIP connection.",
};

const features = [
  {
    href: "/features/battery-health",
    title: "Battery health",
    body: "State of health and charge, pack voltage, 108 cell-group potentials on CMA, min/max/delta and pack temperature.",
  },
  {
    href: "/features/vehicle-diagnostics",
    title: "Vehicle diagnostics",
    body: "ECU discovery over DoIP, identification data, DTCs by status with freeze frames, and session export for evidence.",
  },
  {
    href: "/features/live-data",
    title: "Live data",
    body: "Pack voltage and current, battery and inverter temperature, motor torque and 12 V system, sampled and plotted.",
  },
  {
    href: "/features/service-functions",
    title: "Service functions",
    body: "EPB service mode, 12 V adaptation, reminder reset, HVAC calibration and selected UDS routines, gated behind explicit write access.",
  },
];

export default async function FeaturesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="features" />
      <Container className="py-14 sm:py-20">
        <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.href} className="bg-surface">
              <Link href={f.href} className="group flex h-full flex-col p-6 transition-colors hover:bg-bg-secondary">
                <h2 className="flex items-center justify-between text-xl font-medium tracking-tight text-text-primary">
                  {f.title}
                  <ArrowRight
                    className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{f.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
