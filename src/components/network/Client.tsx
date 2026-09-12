"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

/**
 * The React Flow canvas is client-only: prerendering it under the static
 * export would crash on DOM APIs and paint nothing useful anyway, so the
 * whole workbench loads as a client chunk with a localized status line.
 */
const NetworkExplorer = dynamic(() => import("./NetworkExplorer"), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  const t = useTranslations("network");
  return (
    <div role="status" className="grid h-full place-items-center font-mono text-[12px] uppercase tracking-[0.12em] text-text-muted">
      {t("loading")}
    </div>
  );
}

export function NetworkExplorerClient() {
  return (
    <div className="h-full w-full">
      <NetworkExplorer />
    </div>
  );
}
