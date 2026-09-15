import { getTranslations } from "next-intl/server";
import { Figure } from "@/components/ui/layout";
import { Shot } from "@/components/ui/Shot";
import { shotsFor } from "@/lib/shots";

/**
 * The real application captures for one feature route, as bezel-framed
 * figures with a mono channel legend.
 *
 * Every feature page used to be `LocalizedPageHeader` + `Prose` + one link -
 * seven pages of text describing an instrument while eighteen captures of that
 * instrument sat unused in `public/assets`. A page about reading a battery
 * matrix should show the battery matrix.
 */
export async function FeatureShots({ href }: { href: string }) {
  const ts = await getTranslations("shots");
  const entries = shotsFor(href);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2xl">
      <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-title)] leading-tight text-text-primary">
        {ts("onThisPage")}
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {entries.map((s) => (
          <Figure
            key={s.root}
            caption={ts(s.detailKey)}
            className={entries.length === 1 ? "lg:col-span-2" : undefined}
          >
            <div className="overflow-hidden rounded-sm border border-line bg-bg-secondary">
              <Shot
                root={s.root}
                alt={ts(s.labelKey)}
                width={3456}
                height={2088}
                sizes="(min-width: 1024px) 560px, 92vw"
                imgClassName="block h-auto w-full"
              />
            </div>
          </Figure>
        ))}
      </div>
    </div>
  );
}
