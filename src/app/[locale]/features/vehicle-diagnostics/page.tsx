import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { ScanSimulator } from "@/components/features/ScanSimulator";
import { EcuTopology } from "@/components/architecture/EcuTopology";

export const metadata: Metadata = {
  title: "Vehicle diagnostics",
  description:
    "ECU discovery over DoIP, identification data, DTCs by status with freeze frames, and diagnostic session export to JSON and CSV.",
};

export default async function VehicleDiagnosticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="vehicleDiagnostics" />

      <Container className="py-xl lg:py-2xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Prose>
            <h2>Discovery</h2>
            <p>
              A UDP identification request on port 13400 enumerates responders. openCMA then opens a
              TCP channel, activates routing, and probes each address for a UDS session.
            </p>
            <h2>Fault codes</h2>
            <p>
              DTCs are read with the ReadDTCInformation service and reported with their status:
              active, pending, stored or historical. Where the ECU kept a freeze frame or snapshot,
              openCMA retrieves it alongside the code.
            </p>
            <h2>Identification</h2>
            <p>
              VIN, ECU part numbers, hardware and software versions and supplier identifiers are read
              with ReadDataByIdentifier. The VIN is left out of exports that don&apos;t need it.
            </p>
            <h2>Evidence</h2>
            <p>
              A session exports to JSON or CSV. Run one before a repair and one after: the second
              scan shows fewer codes and fewer active faults.
            </p>
          </Prose>
          <div>
            <ScanSimulator />
            <div className="mt-4">
              <MoreLink href="/docs/dtc-scanning">DTC scanning documentation</MoreLink>
            </div>
          </div>
        </div>
      </Container>

      <EcuTopology />
    </>
  );
}
