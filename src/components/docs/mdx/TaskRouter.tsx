import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { taskRoutes } from "@/lib/task-routes";

/**
 * "I want to do X" to "here is the screen" router. Answers the question the
 * screen tour cannot: a reader with a goal, not a screen name.
 *
 * Labels come from the message catalog (`tasks.*`), not hardcoded strings, so
 * the Swedish page renders Swedish rows. The hrefs are structure and live in
 * `src/lib/task-routes.ts`; the hygiene gate checks each one resolves.
 */
export async function TaskRouter() {
  const t = await getTranslations("tasks");

  return (
    <div className="my-6 overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-line-strong text-left">
            <th className="px-3 py-2 font-medium text-text-primary">{t("columnTask")}</th>
            <th className="px-3 py-2 font-medium text-text-primary">{t("columnScreen")}</th>
          </tr>
        </thead>
        <tbody>
          {taskRoutes.map((r) => (
            <tr key={r.key} className="border-b border-line last:border-0">
              <td className="px-3 py-2 text-text-secondary">{t(`rows.${r.key}.task`)}</td>
              <td className="px-3 py-2">
                <Link
                  href={r.href}
                  className="text-text-primary underline decoration-line-strong underline-offset-2 hover:text-accent"
                >
                  {t(`rows.${r.key}.screen`)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
