"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ecus } from "@/lib/ecus";
import { vehicleAnchor, vehicles } from "@/lib/vehicles";
import { cn } from "@/lib/cn";
import docsIndexJson from "@/lib/generated/docs-index.json";

/**
 * Site-wide command palette (Ctrl/Cmd+K). The app advertises its own palette
 * on the home page; the website holds itself to the same interaction. One
 * dialog for the whole site: pages, vehicles, ECU codes and the docs (titles,
 * summaries, headings and a body excerpt from the prebuild index).
 */

type Entry = {
  group: string;
  label: string;
  sub?: string;
  text?: string;
  href: string;
};

const subscribe = () => () => {};
const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

type CommandCtx = { open: (query?: string) => void };
const Ctx = createContext<CommandCtx | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("command");
  const tn = useTranslations("nav");
  const tf = useTranslations("footer.links");
  const tfeatures = useTranslations("features");
  const tp = useTranslations("platforms");
  const tdoc = useTranslations("docs");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const prevActive = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openDialog = useCallback((initial?: string) => {
    prevActive.current = document.activeElement as HTMLElement;
    setQuery(initial ?? "");
    setOpen(true);
  }, []);
  const closeDialog = useCallback(() => setOpen(false), []);

  const entries = useMemo<Entry[]>(() => {
    const groups = {
      pages: t("groupPages"),
      features: t("groupFeatures"),
      vehicles: t("groupVehicles"),
      ecus: t("groupEcus"),
      docs: tdoc("eyebrow"),
    };
    const out: Entry[] = [
      { group: groups.pages, label: t("homePage"), href: "/" },
      { group: groups.pages, label: tn("features"), href: "/features" },
      { group: groups.pages, label: tn("vehicles"), href: "/vehicles", text: t("vehiclesHint") },
      { group: groups.pages, label: tn("network"), href: "/network", text: t("networkHint") },
      { group: groups.pages, label: tf("download"), href: "/download" },
      { group: groups.pages, label: tf("changelog"), href: "/changelog", text: t("changelogHint") },
      { group: groups.pages, label: tn("screenshots"), href: "/screenshots" },
      { group: groups.pages, label: tdoc("eyebrow"), href: "/docs" },
      { group: groups.pages, label: tn("safety"), href: "/safety" },
      { group: groups.pages, label: tf("privacy"), href: "/privacy" },
      { group: groups.pages, label: tf("about"), href: "/about" },
      { group: groups.pages, label: tn("projects"), href: "/projects" },
      ...[
        ["/features/battery-health", tfeatures("batteryCta")],
        ["/features/vehicle-diagnostics", tfeatures("scanCta")],
        ["/features/live-data", tfeatures("liveCta")],
        ["/features/system-telemetry", tfeatures("systemsCta")],
        ["/features/inspection-reports", tfeatures("reportsCta")],
        ["/features/sessions-and-evidence", tfeatures("evidenceCta")],
        ["/features/service-functions", tfeatures("serviceCta")],
      ].map(([href, label]) => ({ group: groups.features, label, href })),
      ...vehicles.map((v) => ({
        group: groups.vehicles,
        label: `${v.manufacturer} ${v.model}`,
        sub: `${v.platform} · ${tp(`status.${v.status}`)}`,
        text: v.note ?? "",
        href: `/vehicles#${vehicleAnchor(v)}`,
      })),
      ...ecus.map((e) => ({
        group: groups.ecus,
        label: e.code,
        sub: e.name,
        text: `${e.code} ${e.name}`,
        href: `/docs/ecu-reference#${e.domain}`,
      })),
      ...docsIndexJson.entries.flatMap((d) => [
        {
          group: groups.docs,
          label: d.title,
          sub: d.summary,
          text: d.text,
          href: `/docs/${d.slug}`,
        },
        ...d.headings.map((h) => ({
          group: groups.docs,
          label: h.text,
          sub: d.title,
          text: "",
          href: `/docs/${d.slug}#${h.id}`,
        })),
      ]),
    ];
    return out;
  }, [t, tn, tf, tfeatures, tp, tdoc]);

  const hits = useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.filter((e) => e.group === entries[0].group).slice(0, 10);
    const scored: [number, Entry][] = [];
    for (const e of entries) {
      const label = e.label.toLowerCase();
      const sub = (e.sub ?? "").toLowerCase();
      const text = (e.text ?? "").toLowerCase();
      let score = -1;
      if (label.startsWith(q)) score = 0;
      else if (label.includes(q)) score = 1;
      else if (sub.includes(q)) score = 2;
      else if (text.includes(q)) score = 3;
      if (score >= 0) scored.push([score, e]);
    }
    scored.sort((a, b) => a[0] - b[0]);
    return scored.slice(0, 24).map(([, e]) => e);
  }, [query, entries]);

  // Global Ctrl/Cmd+K. The network explorer page owns this shortcut while it
  // is mounted and preventDefaults it; deferred events are already claimed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        if (e.defaultPrevented) return;
        e.preventDefault();
        if (open) closeDialog();
        else openDialog();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openDialog, closeDialog]);

  // Escape anywhere closes; Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'input, button, [role="option"], a[href]',
          ),
        ).filter((n) => n.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDialog]);

  // Return focus to whatever opened the palette.
  useEffect(() => {
    if (!open && prevActive.current) {
      prevActive.current.focus();
      prevActive.current = null;
    }
  }, [open]);

  function goto(entry: Entry) {
    closeDialog();
    const [path, hash] = entry.href.split("#");
    router.push(hash ? `${path}#${hash}` : entry.href);
  }

  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Entry[]>();
    for (const h of hits) {
      if (!map.has(h.group)) {
        map.set(h.group, []);
        order.push(h.group);
      }
      map.get(h.group)!.push(h);
    }
    return order.map((g) => [g, map.get(g)!] as const);
  }, [hits]);

  return (
    <Ctx.Provider value={{ open: openDialog }}>
      {children}
      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("label")}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={closeDialog}
        >
          <Command
            label={t("label")}
            shouldFilter={false}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[34rem] overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.75} />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder={t("placeholder")}
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
              {grouped.map(([group, items]) => (
                <Command.Group key={group} heading={group}>
                  {items.map((hit, n) => (
                    <Command.Item
                      key={`${hit.href}-${n}`}
                      value={`${hit.href}|${hit.label}|${n}`}
                      onSelect={() => goto(hit)}
                      className={cn(
                        "flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2",
                        "data-[selected=true]:bg-bg-secondary",
                      )}
                    >
                      <span className="truncate text-[13px] text-text-primary">{hit.label}</span>
                      {hit.sub ? (
                        <span className="hidden shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-text-muted sm:block">
                          {hit.sub}
                        </span>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="border-t border-line px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
              {t("hint")}
            </div>
          </Command>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

/** The Docs-page search field: a trigger for the site-wide palette. */
export function CommandTrigger() {
  const ctx = useContext(Ctx);
  const tsearch = useTranslations("docs");
  const mac = useSyncExternalStore(subscribe, isMac, () => false);
  return (
    <button
      type="button"
      onClick={() => ctx?.open()}
      className="flex w-full items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-left font-mono text-[12px] text-text-muted transition-colors hover:border-line-strong hover:text-text-secondary"
    >
      <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span className="flex-1">{tsearch("searchPlaceholder")}</span>
      <kbd className="rounded-[3px] border border-line px-1 py-0.5 text-[10px]">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}

/** Compact header affordance for the same palette. */
export function CommandKButton() {
  const ctx = useContext(Ctx);
  const t = useTranslations("command");
  const mac = useSyncExternalStore(subscribe, isMac, () => false);
  return (
    <button
      type="button"
      onClick={() => ctx?.open()}
      aria-label={t("label")}
      className="hidden h-10 items-center gap-1.5 rounded-sm border border-line px-2.5 font-mono text-[11px] text-text-muted transition-colors hover:border-line-strong hover:text-text-secondary md:inline-flex"
    >
      <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
      {mac ? "⌘K" : "Ctrl K"}
    </button>
  );
}
