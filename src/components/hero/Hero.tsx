import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { HeroInterface } from "./HeroInterface";
import { site } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");

  return (
    <section className="relative border-b border-line">
      <div
        aria-hidden
        className="hairline-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]"
      />
      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="hero-seq">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">{t("lead")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/download">
                {tc("downloadApp")}
                <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button href={site.repoUrl} variant="secondary" external>
                {tc("viewSource")}
              </Button>
            </div>
            <dl className="mt-8 flex flex-col gap-2 font-mono text-[12px] text-text-muted sm:flex-row sm:items-center sm:gap-5">
              <div>
                <dt className="sr-only">Platforms</dt>
                <dd>{t("platforms")}</dd>
              </div>
              <span aria-hidden className="hidden h-3 w-px bg-line-strong sm:block" />
              <div>
                <dt className="sr-only">Principles</dt>
                <dd>{t("principles")}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:pl-4">
            <HeroInterface />
          </div>
        </div>
      </Container>
    </section>
  );
}
