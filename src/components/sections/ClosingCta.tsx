import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

/**
 * Closing statement. One grotesk sentence carries the section; the two actions
 * sit beneath it. No card, no box.
 */
export function ClosingCta() {
  const t = useTranslations("cta");
  const tc = useTranslations("common");
  return (
    <section className="border-t border-line-strong py-2xl lg:py-3xl">
      <Container>
        <h2 className="max-w-[24ch] text-[2.25rem] leading-[1.05] tracking-[-0.024em] sm:text-[3rem] lg:text-[3.5rem]">
          {t("title")}
        </h2>
        <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-text-secondary">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/download">{tc("downloadApp")}</Button>
          <Button href={site.repoUrl} variant="secondary" external>
            {tc("viewSource")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
