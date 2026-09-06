"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { docGroups, docs } from "@/lib/docs";
import { cn } from "@/lib/cn";

export function DocsSidebar() {
  const pathname = usePathname();
  const t = useTranslations("docs");

  return (
    <nav aria-label="Documentation" className="text-[13px]">
      {docGroups.map((group) => (
        <div key={group} className="mb-6">
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
            {t(`groups.${group}`)}
          </h2>
          <ul className="border-l border-line">
            {docs
              .filter((d) => d.group === group)
              .map((d) => {
                const href = `/docs/${d.slug}`;
                const active = pathname === href;
                return (
                  <li key={d.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "-ml-px block border-l-2 py-1.5 pl-3 transition-colors",
                        active
                          ? "border-accent text-text-primary"
                          : "border-transparent text-text-secondary hover:border-line-strong hover:text-text-primary",
                      )}
                    >
                      {d.title}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
