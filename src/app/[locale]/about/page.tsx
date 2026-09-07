import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, MoreLink } from "@/components/ui/layout";
import { Prose } from "@/components/ui/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hanterill is an independent, source-available vehicle diagnostic project for Volvo and Polestar, for private use, not affiliated with any manufacturer.",
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LocalizedPageHeader id="about" />

      <Container className="py-xl lg:py-2xl">
        <Prose>
          <h2>Independence</h2>
          <p>
            Hanterill is an independent project. It is not affiliated with, maintained by, sponsored by
            or authorised by Volvo Cars, Polestar or Geely. Manufacturer and model names are used only
            to describe which vehicles the software can communicate with. No manufacturer logo is used
            as a mark of endorsement.
          </p>

          <h2>License</h2>
          <p>
            The source is available to read. Hanterill is provided for personal, non-commercial use
            under the project license, and is not open source in the OSI sense. The{" "}
            <Link href="/docs/license">license page</Link> has the terms.
          </p>

          <h2>Why it exists</h2>
          <p>
            The diagnostic data a modern EV holds about its own battery and drivetrain is detailed and
            useful, and most of it is readable with standard protocols. Hanterill makes that data
            available to owners and independent workshops without a proprietary interface or a
            recurring fee.
          </p>

          <h2>How it is built</h2>
          <p>
            The diagnostic engine, DoIP stack and decoders are Rust. The desktop shell is Tauri v2,
            so there is no bundled browser engine. The interface is React and TypeScript, typed
            against the engine.
          </p>

          <h2>Contributing</h2>
          <p>
            The most useful contributions are protocol traces, ECU maps and decoder corrections. The
            repository has the details.
          </p>
        </Prose>

        <div className="mt-8 flex flex-wrap gap-6">
          <MoreLink href={site.repoUrl} external>
            Repository
          </MoreLink>
          <MoreLink href="/docs/architecture">Architecture</MoreLink>
          <MoreLink href="/docs/development">Development guide</MoreLink>
        </div>
      </Container>
    </>
  );
}
