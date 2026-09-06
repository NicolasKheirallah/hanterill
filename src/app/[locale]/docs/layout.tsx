import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { getDocsIndex } from "@/lib/docs";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [index, t] = await Promise.all([getDocsIndex(), getTranslations("docs")]);

  return (
    <div className="border-t border-line">
      <Container className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden py-10 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <div className="mb-5">
              <DocsSearch index={index} />
            </div>
            <DocsSidebar />
          </div>
        </aside>

        <div className="py-8 lg:py-10">
          <div className="mb-6 lg:hidden">
            <DocsSearch index={index} />
          </div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            {t("eyebrow")}
          </p>
          {children}
        </div>
      </Container>
    </div>
  );
}
