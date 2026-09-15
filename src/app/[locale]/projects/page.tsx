import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { GitBranch } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { Shot } from "@/components/ui/Shot";
import { otherProjects } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta({ locale, path: "/projects", id: "projects" });
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tp = await getTranslations("projects");

  return (
    <>
      <LocalizedPageHeader id="projects" />

      <Section>
        <ul className="mx-auto grid max-w-[640px] gap-12">
          {otherProjects.map((project) => {
            const copy = tp.raw(project.slug) as {
              tagline: string;
              description: string;
              highlights: string[];
            };
            return (
              <li key={project.name}>
                {/* No bezel here. `.bezel` marks a live instrument, and this is
                    a prose card holding a screenshot - a nested bezel inside a
                    bezel (which this used to be) turns the notch motif into
                    decoration and stops it meaning anything on the pages where
                    it does mark a real readout. */}
                <article className="flex h-full flex-col">
                  <div className="border-b border-line-strong pb-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="text-[length:var(--text-title)] leading-tight text-text-primary">
                        {project.name}
                      </h2>
                      <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                        {project.platform} · {project.license}
                      </p>
                    </div>
                    <p className="mt-2 text-[length:var(--text-prose)] leading-relaxed text-text-secondary">
                      {copy.tagline}
                    </p>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-sm border border-line-strong bg-bg-secondary">
                    <Shot
                      root={project.image}
                      alt={`${project.name} - ${copy.tagline}`}
                      width={591}
                      height={757}
                      sizes="(min-width: 1024px) 640px, 100vw"
                      imgClassName="block h-auto w-full object-cover object-top"
                    />
                  </div>

                  <p className="mt-6 text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                    {copy.description}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {copy.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 font-mono text-[length:var(--text-meta)] leading-relaxed text-text-secondary"
                      >
                        <span aria-hidden className="mt-[0.45em] h-px w-3 shrink-0 bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 border-t border-line pt-5">
                    <Button href={project.repoUrl} className="w-full sm:w-auto">
                      <GitBranch className="h-4 w-4" strokeWidth={1.75} />
                      {t("projectsViewRepo")}
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 max-w-[70ch] font-mono text-[length:var(--text-meta)] leading-relaxed text-text-muted">
          {t("projectsSeparate")}
        </p>
      </Section>
    </>
  );
}
