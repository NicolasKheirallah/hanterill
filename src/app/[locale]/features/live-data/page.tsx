import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { LiveTelemetryChart } from "@/components/telemetry/LiveTelemetryChart";
import { liveChannels } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Live data",
  description:
    "Live engineering telemetry: pack voltage and current, battery and inverter temperature, motor torque and 12 V system voltage.",
};

export default async function LiveDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("telemetry.channelNames");
  return (
    <>
      <LocalizedPageHeader id="liveData" />

      <Container className="py-xl lg:py-2xl">
        <LiveTelemetryChart />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Prose>
            <h2>Channels</h2>
            <p>
              Toggle channels above the chart. Any readable data identifier can be added to a live
              view; common drivetrain and battery channels are grouped by default. Sampling rate is
              bounded by the ECU and the diagnostic session, not by openCMA.
            </p>
            <h2>Reading the chart</h2>
            <p>
              Hover for a synchronised crosshair. Tap or press <strong>Live</strong> to pause and
              inspect a point. The trace here is a deterministic simulated drive cycle, not a vehicle
              reading.
            </p>
            <h2>Export</h2>
            <p>A running view can be written to CSV for offline analysis.</p>
          </Prose>
          <ul className="divide-y divide-line border-y border-line">
            {liveChannels.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between py-3">
                <span className="text-[14px] text-text-secondary">{tc(c.id)}</span>
                <span className="tnum font-mono text-[13px] text-text-primary">
                  {c.value} {c.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <MoreLink href="/docs/architecture">How the polling loop works</MoreLink>
        </div>
      </Container>
    </>
  );
}
