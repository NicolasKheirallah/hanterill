import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { HeroInterface } from "./HeroInterface";
import { site } from "@/lib/site";

/**
 * Split diptych on the Workbench shape: the argument on the left, the live
 * interface on the right. One orchestrated entrance (.hero-seq), skipped under
 * reduced motion. The measurement grid sits behind the instrument only - it
 * frames a readout, it is not a page-wide texture.
 */
export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");

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
      </Container>
    </section>
  );
}
