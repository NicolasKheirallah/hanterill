import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function ClosingCta() {
  const t = useTranslations("cta");
  const tc = useTranslations("common");
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-balance text-3xl font-medium tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-text-secondary">
            {t("body")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
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
