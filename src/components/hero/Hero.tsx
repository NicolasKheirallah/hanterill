import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, MoreLink } from "@/components/ui/layout";
import { HeroInterface } from "./HeroInterface";
import { Shot } from "@/components/ui/Shot";
import { site } from "@/lib/site";

/**
 * Split diptych on the Workbench shape: the argument on the left, the live
 * interface on the right. One orchestrated entrance (.hero-seq), skipped under
 * reduced motion. The measurement grid sits behind the instrument only - it
 * frames a readout, it is not a page-wide texture.
 *
 * Below the fold line, three captures from the real application on the
 * reference vehicle: evidence, not a mockup. Static by design; the replica
 * above carries the motion, these carry the proof.
 */
const CAPTURES = [
  { root: "/assets/overview.png", key: "overview" },
  { root: "/assets/cell-map.png", key: "cellMap" },
  { root: "/assets/fault-codes.png", key: "faultCodes" },
];

export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
  const ts = useTranslations("shots");

  return (
    <section className="border-b border-line-strong">
      <Container className="py-lg pt-xl lg:py-2xl lg:pt-2xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          <div className="hero-seq">
            <h1 className="max-w-[13ch] text-[2.5rem] leading-[1.05] tracking-[-0.026em] sm:text-[2.75rem] lg:max-w-[24ch] lg:text-[2.75rem]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-text-secondary">
              {t("lead")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/download">
                {tc("downloadApp")}
                <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button href={site.repoUrl} variant="secondary" external>
                {tc("viewSource")}
              </Button>
            </div>
          </div>

          <div className="relative lg:pl-2">
            <div
              aria-hidden
              className="hairline-grid pointer-events-none absolute -inset-x-4 -inset-y-6 [mask-image:radial-gradient(120%_120%_at_60%_40%,black,transparent_78%)] lg:-inset-x-8"
            />
            <div className="relative">
              <HeroInterface />
            </div>
          </div>
        </div>

        <div className="mt-xl lg:mt-2xl">
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
              {t("captures")}
            </p>
            <MoreLink href="/screenshots">{t("capturesLink")}</MoreLink>
          </div>
          <ul className="mt-3 grid gap-4 sm:grid-cols-3">
            {CAPTURES.map((c, i) => (
              <li key={c.root} className="bezel overflow-hidden bg-surface">
                <Shot
                  root={c.root}
                  alt={ts(c.key)}
                  width={3456}
                  height={2088}
                  sizes="(min-width: 1024px) 380px, 92vw"
                  priority={i === 0}
                  imgClassName="block"
                />
                <div className="border-t border-line px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                  {ts(c.key)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
