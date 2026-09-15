import { useTranslations } from "next-intl";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

/**
 * One annotated real session, start to finish.
 *
 * The rest of the site asserts that a live session works and shows the shape of
 * one; this is the only place it shows the whole thing end to end - the car,
 * the complaint, the codes with their status bytes, the freeze frame behind
 * them, the pack numbers, the verdict and the after-repair diff. The product's
 * real objection is "will it actually read my car", and an argument cannot
 * answer that. Every value here is the same labelled sample data the rest of
 * the site uses, and says so.
 */
const STEPS = ["arrival", "scan", "codes", "freeze", "battery", "verdict", "after"] as const;

export function CaseStudy() {
  const t = useTranslations("caseStudy");

  return (
    <section className="border-b border-line-strong bg-bg-secondary py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          {/* The session, as a numbered walkthrough - the one genuinely
              sequential piece of content on the page, so it keeps ordinals. */}
          <ol className="overflow-hidden rounded-sm border border-line">
            {STEPS.map((step, i) => (
              <li key={step} className="border-b border-line bg-surface last:border-0">
                <div className="flex items-baseline gap-4 px-5 pt-4">
                  <span className="tnum font-mono text-[length:var(--text-micro)] tracking-[0.08em] text-text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[length:var(--text-title)] leading-tight">
                    {t(`steps.${step}.title`)}
                  </h3>
                </div>
                <p className="max-w-[68ch] px-5 pb-4 pl-[3.4rem] text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                  {t(`steps.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>

          {/* The readout column: the numbers the walkthrough refers to, so the
              prose never has to recite them. */}
          <aside className="bezel bg-surface p-5 lg:sticky lg:top-24">
            <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
              {t("readout")}
            </p>

            <dl className="mt-4 space-y-0">
              {(
                [
                  ["vehicle", t("vehicle")],
                  ["odometer", t("odometer")],
                  ["packsoc", t("packSoc")],
                  ["soh", t("soh")],
                  ["spread", t("spread")],
                  ["temp", t("temp")],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0"
                >
                  <dt className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                    {t(`fields.${k}`)}
                  </dt>
                  <dd className="tnum font-mono text-[length:var(--text-meta)] text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 border-t border-line pt-4">
              <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                {t("codesFound")}
              </p>
              <ul className="mt-3 space-y-2.5">
                {(
                  [
                    ["becm", "error"],
                    ["ccm", "warning"],
                    ["tcam", "info"],
                  ] as const
                ).map(([code, tone]) => (
                  <li key={code} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[length:var(--text-meta)] text-text-primary">
                      {t(`codes.${code}.id`)}
                    </span>
                    <StatusMarker tone={tone} className="text-[length:var(--text-micro)]">
                      {t(`codes.${code}.status`)}
                    </StatusMarker>
                  </li>
                ))}
              </ul>
            </div>

            <p
              className={cn(
                "mt-5 border-t border-line pt-4 font-mono text-[length:var(--text-micro)] leading-relaxed text-text-muted",
              )}
            >
              {t("disclaimer")}
            </p>
          </aside>
        </div>

        <div className="mt-8">
          <MoreLink href="/features/sessions-and-evidence">{t("more")}</MoreLink>
        </div>
      </Container>
    </section>
  );
}
