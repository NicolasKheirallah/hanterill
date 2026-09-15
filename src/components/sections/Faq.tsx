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

/**
 * One FAQPage per document. The home page used to emit the schema twice - once
 * here and once from its own `<script>` - which is a duplicate top-level
 * entity and trips the rich-results validator. `/vehicles` renders a second
 * `<Faq>` with the compatibility questions, so the JSON-LD is opt-in per
 * caller rather than automatic.
 */
export function Faq({
  items,
  title,
  jsonLd = true,
}: {
  items: QA[];
  title: string;
  jsonLd?: boolean;
}) {
  return (
    <section className="border-b border-line py-2xl lg:py-3xl">
      <Container>
        <h2 className="text-[clamp(1.875rem,2.2vw+1rem,2.5rem)] leading-[1.1]">{title}</h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {items.map((it) => (
            <div key={it.q} className="grid items-start gap-2 py-6 lg:grid-cols-[1fr_1.4fr] lg:gap-10">
              <dt className="font-[family-name:var(--font-display)] text-[1.1875rem] leading-snug text-text-primary">
                {it.q}
              </dt>
              <dd className="text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                {it.a}
              </dd>
            </div>
          ))}
        </dl>
        {jsonLd ? <FaqJsonLd items={items} /> : null}
      </Container>
    </section>
  );
}
