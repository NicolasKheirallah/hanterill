import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "openCMA is entirely local. No telemetry, no analytics, no account, no backend, no diagnostic data uploaded. VIN is redacted where it is not needed.",
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="privacy" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>What stays on your machine</h2>
          <ul>
            <li>Every diagnostic session, DTC read and live capture</li>
            <li>Exports you create (JSON, CSV)</li>
            <li>Application settings and connection profiles</li>
            <li>Logs</li>
          </ul>

          <h2>What is never collected</h2>
          <ul>
            <li>No telemetry</li>
            <li>No analytics or usage tracking</li>
            <li>No cloud account</li>
            <li>No external backend</li>
            <li>No diagnostic data uploaded anywhere</li>
            <li>No crash reporting to a third party</li>
          </ul>

          <h2>VIN handling</h2>
          <p>
            The VIN is read as part of vehicle identification. In logs and exports, openCMA redacts
            it where it is not required, so a shared session file does not carry a full VIN by
            default.
          </p>

          <h2>Network activity</h2>
          <p>
            During a session, openCMA communicates only with the vehicle over the local Ethernet
            link. The website may query the GitHub API to show the latest release and repository
            stats; the application itself does not require any internet connection to run.
          </p>

          <h2>No subscription</h2>
          <p>
            There is no paid tier and no license server. The source is available to read and there is
            nothing to monetise in your vehicle data.
          </p>
        </Prose>
      </Container>
    </>
  );
}
