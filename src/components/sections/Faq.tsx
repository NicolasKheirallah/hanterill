import { Container } from "@/components/ui/layout";

export type QA = { q: string; a: string };

export function FaqJsonLd({ items }: { items: QA[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}

export function Faq({ items, title }: { items: QA[]; title: string }) {
  return (
    <section className="border-b border-line py-2xl lg:py-3xl">
      <Container>
        <h2 className="text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">{title}</h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {items.map((it) => (
            <div key={it.q} className="grid items-start gap-2 py-6 lg:grid-cols-[1fr_1.4fr] lg:gap-10">
              <dt className="font-[family-name:var(--font-display)] text-[1.1875rem] leading-snug text-text-primary">
                {it.q}
              </dt>
              <dd className="text-[15px] leading-relaxed text-text-secondary">{it.a}</dd>
            </div>
          ))}
        </dl>
        <FaqJsonLd items={items} />
      </Container>
    </section>
  );
}
