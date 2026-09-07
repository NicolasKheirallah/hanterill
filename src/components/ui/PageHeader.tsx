import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container, Eyebrow } from "./layout";

/**
 * Translated page header. `id` selects `pages.{id}Title/Lead` from the message
 * catalog, so interior pages stay one line and follow the locale.
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
    <PageHeader title={t(`${id}Title`)} lead={t(`${id}Lead`)}>
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
    <header className="border-b border-line-strong">
      <Container className="py-xl lg:py-2xl">
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-[20ch] text-[2.5rem] leading-[1.04] tracking-[-0.024em] sm:text-[3.25rem] lg:text-[3.75rem]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-[58ch] text-[1.125rem] leading-relaxed text-text-secondary">{lead}</p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </header>
  );
}
