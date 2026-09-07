import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "Service functions",
  description:
    "Gated service routines: EPB service mode, 12 V battery adaptation, service reminder reset, HVAC damper calibration and selected UDS routines.",
};

const routines = [
  ["Electric parking brake", "Service position for pad replacement", "RoutineControl"],
  ["12 V battery", "Adaptation reset after replacement", "WriteDataByIdentifier"],
  ["Service reminder", "Reset interval counter", "RoutineControl"],
  ["Climate control", "HVAC damper calibration", "RoutineControl"],
  ["Windows and sunroof", "Normalisation after power loss", "RoutineControl"],
];

export default async function ServiceFunctionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="serviceFunctions" />

      <Container className="py-xl lg:py-2xl">
        <div className="mb-10 flex items-start gap-3 border-l-2 border-status-warning py-1 pl-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" strokeWidth={1.75} />
          <p className="text-[14px] leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">
              Write operations are off by default.
            </span>{" "}
            Hanterill will not run a routine without your explicit, per-session go-ahead. Read-only
            diagnostics are unaffected.
          </p>
        </div>

        <table className="w-full border-collapse border-t border-line-strong text-[14px]">
          <thead>
            <tr>
              <th className="border-b border-line-strong px-3 py-2.5 text-left font-medium">System</th>
              <th className="border-b border-line-strong px-3 py-2.5 text-left font-medium">Routine</th>
              <th className="hidden border-b border-line-strong px-3 py-2.5 text-left font-medium sm:table-cell">
                UDS service
              </th>
            </tr>
          </thead>
          <tbody>
            {routines.map(([sys, desc, svc]) => (
              <tr key={sys}>
                <td className="border-b border-line px-3 py-2.5 text-text-primary">{sys}</td>
                <td className="border-b border-line px-3 py-2.5 text-text-secondary">{desc}</td>
                <td className="hidden border-b border-line px-3 py-2.5 font-mono text-[12px] text-text-muted sm:table-cell">
                  {svc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Prose className="mt-10">
          <h2>Availability</h2>
          <p>
            Routine support depends on the ECU and the platform. A routine that is not implemented for
            a given vehicle is not shown. Experimental platforms do not expose service functions.
          </p>
        </Prose>
        <div className="mt-4">
          <MoreLink href="/safety">Safety documentation</MoreLink>
        </div>
      </Container>
    </>
  );
}
