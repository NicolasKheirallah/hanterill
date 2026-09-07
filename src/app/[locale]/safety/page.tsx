import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { SafetySection } from "@/components/sections/SafetySection";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "How openCMA separates read-only diagnostics from operations that change the vehicle, and what software access does and does not make safe.",
};

export default async function SafetyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="safety" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>Read-only is the default</h2>
          <p>
            Battery data, ECU identification, fault codes and live telemetry are all read operations.
            Running them cannot change vehicle configuration. This is the large majority of what
            openCMA does.
          </p>

          <h2>Operations that change the vehicle</h2>
          <p>
            Clearing diagnostic information, service routines and adaptations alter ECU state. In
            openCMA these are grouped separately, labelled, and disabled until you explicitly enable
            write access for the session. They fail closed: if the opt-in is not present, the request
            is not sent.
          </p>

          <h2>High voltage</h2>
          <p>
            Electric vehicles carry hazardous high-voltage systems. Reading battery data over a
            diagnostic link does not de-energise anything and does not make physical high-voltage
            service safe. HV service requires procedures, equipment and training from the manufacturer.
          </p>

          <h2>Not a substitute for manufacturer tooling</h2>
          <p>
            openCMA is an independent project. It does not replace the diagnostic system supplied by
            the manufacturer, and it is not affiliated with Volvo Cars, Polestar or Geely. Use it to
            understand your vehicle, not as the sole basis for a safety-critical repair decision.
          </p>

          <h2>Provisional platforms</h2>
          <p>
            On Experimental or Research platforms, decoding is not verified. Do not rely on battery
            figures or fault interpretation, and do not run service routines.
          </p>
        </Prose>
      </Container>

      <SafetySection />
    </>
  );
}
