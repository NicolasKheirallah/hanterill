import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "./layout";

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

/**
 * The one h1 treatment on the site. Every page - home included - resolves to
 * `--text-display`, the documented type anchor. Before this, the home page h1
 * topped out at 2.75rem while interior pages reached 3.75rem and `/network`
 * sat at 1.6rem: a 2.4x spread in which the most important page had the
 * smallest headline, and `--text-display` was used nowhere at all.
 *
 * Tracking is not set here - `globals.css` owns it for every heading.
 */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line-strong">
      <Container className="py-xl pt-2xl lg:py-2xl lg:pt-3xl">
        <h1 className="max-w-[18ch] text-[length:var(--text-display)] leading-[1.02]">{title}</h1>
        {lead ? (
          <p className="mt-5 max-w-[58ch] text-[length:var(--text-prose)] leading-relaxed text-text-secondary">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </header>
  );
}
