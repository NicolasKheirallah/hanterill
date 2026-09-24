import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, MoreLink } from "@/components/ui/layout";
import { HeroInterface } from "./HeroInterface";
import { ScreenshotGallery } from "@/components/screenshots/ScreenshotGallery";
import { site } from "@/lib/site";

/**
 * Split diptych on the Workbench shape: the argument on the left, the live
 * interface on the right. One orchestrated entrance (.hero-seq), skipped under
 * reduced motion. The measurement grid sits behind the instrument only - it
 * frames a readout, it is not a page-wide texture.
 *
 * Below the fold line, one capture from the real application on the reference
 * vehicle, at a size where its interface text is actually readable: evidence,
 * not a mockup. It opens in the gallery lightbox; the full gallery keeps the
 * rest.
 */
const FEATURED = [{ root: "/assets/overview.png", key: "overview" }];

export function Hero() {
  const t = useTranslations("hero");
  const tc = useTranslations("common");
  const ts = useTranslations("shots");
  const tp = useTranslations("pricing");

  return (
    <section className="border-b border-line-strong">
      <Container className="py-lg pt-xl lg:py-2xl lg:pt-2xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          <div className="hero-seq">
            {/* The site's largest headline - the home page should not have the
                smallest h1 on the site, which it did at 2.75rem. Same anchor
                as every other page. */}
            <h1 className="max-w-[15ch] text-[length:var(--text-display)] leading-[1.03] lg:max-w-[18ch]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[length:var(--text-prose)] leading-relaxed text-text-secondary">
              {t("lead")}
            </p>
            {/* The first two decisions a visitor makes: take the app, and check
                it against their own car. Both sit here; the source is the
                quieter third action. */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/download">
                {tc("downloadApp")}
                <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button href="/vehicles" variant="secondary">
                {tc("checkVehicle")}
              </Button>
              <Button href={site.repoUrl} variant="ghost" external>
                {tc("viewSource")}
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[13.5px] text-text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-ok" aria-hidden />
              {tp("promise")}
            </p>
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
            <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
              {t("captures")}
            </p>
            <MoreLink href="/screenshots">{t("capturesLink")}</MoreLink>
          </div>
          <div className="mt-3">
            <ScreenshotGallery
              feature
              shots={FEATURED.map((c) => ({ root: c.root, label: ts(c.key) }))}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
