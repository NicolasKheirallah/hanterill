"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Container, SectionHeading } from "@/components/ui/layout";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { DUR, EASE } from "@/lib/motion";
import { ecus, type Ecu } from "@/lib/ecus";
import { cn } from "@/lib/cn";

const domains = ["gateway", "energy", "chassis", "cabin"] as const;

export function EcuTopology() {
  const reduce = useReducedMotion();
  const t = useTranslations("ecuTopology");
  const [selected, setSelected] = useState<Ecu>(ecus.find((e) => e.code === "BECM") ?? ecus[0]);

  return (
    <section className="border-b border-line bg-bg-secondary py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading title={t("title")} lead={t("lead")} />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {domains.map((d) => {
                const list = ecus.filter((e) => e.domain === d);
                return (
                  <div key={d}>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                      {t(`domains.${d}`)}
                    </div>
                    <p className="mt-0.5 text-[11px] text-text-secondary">{t(`domainBlurbs.${d}`)}</p>
                    <ul className="mt-2">
                      {list.map((e) => {
                        const active = selected.code === e.code;
                        return (
                          <li key={e.code}>
                            <button
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSelected(e)}
                              className={cn(
                                "-ml-px flex w-full items-center justify-between gap-2 border-l-2 py-1.5 pl-3 text-left font-mono text-[12px] transition-colors",
                                active
                                  ? "border-accent text-text-primary"
                                  : "border-line text-text-secondary hover:border-line-strong hover:text-text-primary",
                              )}
                            >
                              <span>{e.code}</span>
                              {!e.diagnostic ? (
                                <span className="text-[10px] uppercase text-text-muted">{t("noUds")}</span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.code}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: DUR.base, ease: EASE.standard }}
              >
                <div className="font-mono text-[15px] text-text-primary">{selected.code}</div>
                <div className="mt-0.5 text-[14px] text-text-secondary">{selected.name}</div>
                <dl className="mt-4 space-y-0 border-t border-line pt-3 font-mono text-[12px]">
                  <Row label={t("domain")} value={t(`domains.${selected.domain}`)} />
                  <Row
                    label={t("partNumber")}
                    value={selected.partNumber ?? t("notPublished")}
                    tone={selected.partNumber ? undefined : "text-text-muted"}
                  />
                  <div className="flex items-baseline justify-between py-1.5">
                    <dt className="text-text-secondary">{t("diagnostics")}</dt>
                    <dd>
                      <StatusMarker tone={selected.diagnostic ? "ok" : "muted"}>
                        {selected.diagnostic ? t("udsSession") : t("noUdsSession")}
                      </StatusMarker>
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/docs/ecu-reference"
                  className="mt-3 inline-block font-mono text-[11px] text-accent transition-colors hover:text-accent-hover"
                >
                  {t("fullReference")}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className={cn("tnum text-text-primary", tone)}>{value}</dd>
    </div>
  );
}
