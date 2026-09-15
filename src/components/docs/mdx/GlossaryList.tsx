import { glossary, glossaryGroups } from "@/lib/glossary";

/**
 * Renders the whole glossary as definition lists grouped by concern, driven by
 * `src/lib/glossary.ts`. One source for the terms used across the docs and the
 * surface UI, so a term cannot be defined two different ways.
 */
export function GlossaryList() {
  return (
    <div className="my-6 space-y-8">
      {glossaryGroups.map((group) => {
        const rows = glossary.filter((e) => e.group === group);
        return (
          <section key={group}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
              {group}
            </h3>
            <dl className="mt-3 divide-y divide-line border-y border-line">
              {rows.map((e) => (
                <div key={e.term} className="grid gap-1 py-3 sm:grid-cols-[minmax(7rem,max-content)_1fr] sm:gap-6">
                  <dt className="text-[14px] text-text-primary">
                    <span className="font-mono">{e.term}</span>
                    <span className="mt-0.5 block text-[12px] text-text-muted">{e.full}</span>
                  </dt>
                  <dd className="text-[14px] leading-relaxed text-text-secondary">{e.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
