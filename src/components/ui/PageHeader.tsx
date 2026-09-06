import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "./layout";

/**
 * Translated page header. `id` selects `pages.{id}Eyebrow/Title/Lead` from the
 * message catalog, so interior pages stay one line and follow the locale.
 */
export async function LocalizedPageHeader({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) {
  const t = await getTranslations("pages");
  return (
    <PageHeader eyebrow={t(`${id}Eyebrow`)} title={t(`${id}Title`)} lead={t(`${id}Lead`)}>
      {children}
    </PageHeader>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line">
      <Container className="py-14 sm:py-20">
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight sm:text-5xl">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">{lead}</p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </header>
  );
}
