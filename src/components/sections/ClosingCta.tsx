import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function ClosingCta() {
  const t = useTranslations("cta");
  const tc = useTranslations("common");
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
            {t("body")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/download">{tc("downloadApp")}</Button>
            <Button href={site.repoUrl} variant="secondary" external>
              {tc("viewOnGitHub")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
