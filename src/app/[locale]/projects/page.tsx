import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { GitBranch } from "lucide-react";
import { LocalizedPageHeader } from "@/components/ui/PageHeader";
import { Container, Eyebrow } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";
import { otherProjects } from "@/lib/site";

// Same basePath handling as the screenshots gallery: `next/image` with
// `unoptimized` does not prepend it to a plain string src.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Other projects",
  description:
    "Other independent projects from the same author as Hanterill, including Hisingen — Polestar and Volvo vehicle telemetry, native in the macOS menu bar.",
};

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <>
      <LocalizedPageHeader id="projects" />

      <Container className="py-xl lg:py-2xl">
        <ul
          className={
            otherProjects.length > 1
              ? "grid gap-10 lg:grid-cols-2 lg:gap-8"
              : "mx-auto grid max-w-[560px] gap-10"
          }
        >
          {otherProjects.map((project) => (
            <li key={project.name}>
              <article className="bezel flex h-full flex-col bg-surface">
                <div className="border-b border-line p-4 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-[1.75rem] leading-tight tracking-[-0.018em] text-text-primary">
                      {project.name}
                    </h2>
                    <p className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-text-muted">
                      {project.platform} · {project.license}
                    </p>
                  </div>
                  <p className="mt-2 text-[1.0625rem] leading-relaxed text-text-secondary">
                    {project.tagline}
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  <figure className="bezel overflow-hidden bg-bg-secondary">
                    <Image
                      src={`${BASE}${project.image}`}
                      alt={`${project.name} — ${project.tagline}`}
                      width={591}
                      height={757}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="h-auto w-full object-cover object-top"
                    />
                  </figure>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-6 px-4 pb-6 sm:px-6">
                  <p className="text-[15px] leading-relaxed text-text-secondary">
                    {project.description}
                  </p>

                  <div>
                    <Eyebrow className="mb-3">{project.name}</Eyebrow>
                    <ul className="space-y-2">
                      {project.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 font-mono text-[12.5px] leading-relaxed text-text-secondary"
                        >
                          <span aria-hidden className="mt-[0.45em] h-px w-3 shrink-0 bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-line pt-5">
                    <Button href={project.repoUrl} className="w-full sm:w-auto">
                      <GitBranch className="h-4 w-4" strokeWidth={1.75} />
                      {t("projectsViewRepo")}
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-[70ch] font-mono text-[12.5px] leading-relaxed text-text-muted">
          {t("projectsSeparate")}
        </p>
      </Container>
    </>
  );
}