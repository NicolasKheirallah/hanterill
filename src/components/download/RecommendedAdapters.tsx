import { getTranslations } from "next-intl/server";

/**
 * The adapters that actually work, and the ones that do not.
 *
 * This is the first pre-purchase question for a passive-cable product - the
 * README names six makes and none of it was on the site. Anything with a
 * chipset that terminates the link is the wrong part, so the list is
 * deliberately short and specific rather than "any USB Ethernet adapter".
 */
export async function RecommendedAdapters() {
  const t = await getTranslations("adapters");

  const works = t.raw("works") as string[];
  const avoid = t.raw("avoid") as string[];

  return (
    <div>
      <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
        {t("worksLabel")}
      </p>
      <ul className="mt-3 space-y-2">
        {works.map((w) => (
          <li
            key={w}
            className="flex items-start gap-2.5 text-[length:var(--text-body)] leading-relaxed text-text-secondary"
          >
            <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-status-ok" />
            {w}
          </li>
        ))}
      </ul>

      <p className="mt-6 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
        {t("avoidLabel")}
      </p>
      <ul className="mt-3 space-y-2">
        {avoid.map((a) => (
          <li
            key={a}
            className="flex items-start gap-2.5 text-[length:var(--text-body)] leading-relaxed text-text-secondary"
          >
            <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-status-error" />
            {a}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[length:var(--text-ui)] leading-relaxed text-text-muted">{t("why")}</p>
    </div>
  );
}
