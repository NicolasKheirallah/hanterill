import { getTranslations } from "next-intl/server";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { serviceFamilies, serviceStatusMeta } from "@/lib/vehicles";

/**
 * Service modes and their honest status. Every row names the module and the
 * job in plain language; no request identifiers appear because the reader's
 * question is "can this drive my car's routine", not "which string does it
 * send". Copy lives in `platforms.service` / `platforms.serviceNotes`; this
 * component only maps status to a tone.
 */
export async function ServiceModes() {
  const t = await getTranslations("platforms");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse border-t border-line-strong text-[14px]">
        <caption className="sr-only">{t("serviceModesHeading")}</caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
              {t("serviceModesModule")}
            </th>
            <th scope="col" className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
              {t("serviceModesService")}
            </th>
            <th scope="col" className="border-b border-line-strong px-3 py-2.5 text-left font-medium">
              {t("serviceModesStatus")}
            </th>
          </tr>
        </thead>
        <tbody>
          {serviceFamilies.map((family) => (
            <tr key={family.key}>
              <td className="border-b border-line px-3 py-2.5 align-top text-text-muted">
                {family.module}
              </td>
              <td className="border-b border-line px-3 py-2.5 align-top">
                <span className="text-text-primary">{t(`service.${family.key}`)}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-text-secondary">
                  {t(`serviceNotes.${family.key}`)}
                </span>
              </td>
              <td className="border-b border-line px-3 py-2.5 align-top whitespace-nowrap">
                <StatusMarker tone={serviceStatusMeta[family.status].tone}>
                  {t(`serviceStatus.${family.status}`)}
                </StatusMarker>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
