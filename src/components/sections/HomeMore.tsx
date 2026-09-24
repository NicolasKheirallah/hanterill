import { useTranslations } from "next-intl";
import { Container, MoreLink, SectionHeading } from "@/components/ui/layout";

/**
 * The off-ramp from the short home page. The full feature walkthrough, the
 * interactive session and the case study moved to their own pages; this strip
 * is where the home page hands the reader who wants all of it. One heading,
 * four typographic links, no cards.
 */
const LINKS = [
  { ns: "walkthrough", href: "/features/walkthrough" },
  { ns: "features", href: "/features" },
  { ns: "caseStudy", href: "/case-study" },
  { ns: "network", href: "/network" },
] as const;

export function HomeMore() {
  const t = useTranslations("home");
  return (
    <section className="border-b border-line py-xl lg:py-2xl">
      <Container>
        <SectionHeading title={t("moreTitle")} lead={t("moreLead")} />
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <MoreLink href={l.href}>{t(l.ns)}</MoreLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
