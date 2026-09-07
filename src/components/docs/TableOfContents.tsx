"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { DocHeading } from "@/lib/docs";
import { cn } from "@/lib/cn";

/**
 * "On this page". Highlights the heading currently in view using an
 * IntersectionObserver, so there is no scroll listener.
 */
export function TableOfContents({ headings }: { headings: DocHeading[] }) {
  const t = useTranslations("docs");
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (!headings.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label={t("onThisPage")} className="text-[12px]">
      <p className="mb-2 font-mono text-[11px] text-text-muted">
        {t("onThisPage")}
      </p>
      <ul className="border-l border-line">
        {headings.map((h) => (
          <li key={h.id} className="-ml-px">
            <a
              href={`#${h.id}`}
              className={cn(
                "block border-l-2 py-1 transition-colors",
                h.level === 3 ? "pl-6" : "pl-3",
                activeId === h.id
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
