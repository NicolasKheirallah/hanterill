"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { DocIndexEntry } from "@/lib/docs";
import { cn } from "@/lib/cn";

type Hit = { slug: string; group: string; title: string; label: string; hash?: string };

const subscribe = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

export function DocsSearch({ index }: { index: DocIndexEntry[] }) {
  const t = useTranslations("docs");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mac = useSyncExternalStore(subscribe, isMac, () => false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Hit[] = [];
    for (const d of index) {
      const inTitle = d.title.toLowerCase().includes(q);
      const inText = d.text.toLowerCase().includes(q);
      const inSummary = d.summary.toLowerCase().includes(q);
      if (!q || inTitle || inText || inSummary) {
        out.push({ slug: d.slug, group: d.group, title: d.title, label: d.summary });
      }
      for (const h of d.headings) {
        if (q && h.text.toLowerCase().includes(q)) {
          out.push({
            slug: d.slug,
            group: d.group,
            title: `${d.title}`,
            label: h.text,
            hash: h.id,
          });
        }
      }
    }
    return out.slice(0, 24);
  }, [query, index]);

  function goto(hit: Hit) {
    setOpen(false);
    setQuery("");
    router.push(`/docs/${hit.slug}${hit.hash ? `#${hit.hash}` : ""}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-left font-mono text-[12px] text-text-muted transition-colors hover:border-line-strong hover:text-text-secondary"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="flex-1">{t("searchPlaceholder")}</span>
        <kbd className="rounded-[3px] border border-line px-1 py-0.5 text-[10px]">
          {mac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <Command
            label={t("search")}
            shouldFilter={false}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className="w-full max-w-[32rem] overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.75} />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder={t("searchPlaceholder")}
                className="h-11 flex-1 bg-transparent text-[14px] text-text-primary outline-none placeholder:text-text-muted"
              />
              <kbd className="rounded-[3px] border border-line px-1 py-0.5 font-mono text-[10px] text-text-muted">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-[52vh] overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-[13px] text-text-muted">
                {t("noResults")}
              </Command.Empty>
              {hits.map((hit, n) => (
                <Command.Item
                  key={`${hit.slug}-${hit.hash ?? "root"}-${n}`}
                  value={`${hit.slug}-${hit.hash ?? ""}-${n}`}
                  onSelect={() => goto(hit)}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-sm px-3 py-2",
                    "data-[selected=true]:bg-bg-secondary",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-text-primary">
                      {hit.hash ? hit.label : hit.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {hit.group} {hit.hash ? `/ ${hit.title}` : ""}
                    </span>
                  </span>
                  {!hit.hash ? (
                    <span className="text-[12px] text-text-secondary">{hit.label}</span>
                  ) : null}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}

