"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { motion, useInView } from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-motion-prefs";
import { Car, Cable, Laptop, Gauge } from "lucide-react";
import { Container, SectionHeading, MoreLink } from "@/components/ui/layout";
import { Disclosure } from "@/components/ui/Disclosure";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Node = {
  id: "vehicle" | "enet" | "computer" | "hanterill";
  icon: typeof Car;
};

const nodes: Node[] = [
  { id: "vehicle", icon: Car },
  { id: "enet", icon: Cable },
  { id: "computer", icon: Laptop },
  { id: "hanterill", icon: Gauge },
];

/** The passive-cable chain, and the things it replaces. */
const chainKeys = ["obd", "enet", "rj45", "usb", "laptop"] as const;
const notWantedKeys = ["elm", "j2534", "bluetooth", "driver"] as const;

export function ConnectionDiagram() {
  const reduce = useReducedMotionSafe();
  const tt = useTranslations("connection");
  const th = useTranslations("hardware");
  const linkLabels = [tt("linkObd"), tt("linkEthernet"), tt("linkUsb")];
  const [phase, setPhase] = useState<"request" | "response">("request");
  const railRef = useRef<HTMLDivElement>(null);
  const inView = useInView(railRef, { amount: 0.5 });
  const animate = inView && !reduce;

  return (
    <section className="border-b border-line py-2xl lg:py-3xl">
      <Container>
        <SectionHeading title={tt("title")} lead={tt("lead")} />

        <div className="bezel mt-12 bg-surface p-6 sm:p-10">
          {/* Mobile: vertical list of poppable nodes */}
          <ol className="flex flex-col sm:hidden">
            {nodes.map((n, i) => (
              <li key={n.id}>
                <NodeButton node={n} orientation="mobile" tt={tt} facts={tt.raw(`facts.${n.id}`) as string[]} />
                {i < nodes.length - 1 ? (
                  <div className="ml-5 flex items-center gap-3 py-2">
                    <span className="h-6 w-px bg-line-strong" />
                    <span className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                      {linkLabels[i]}
                    </span>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          {/* Desktop: horizontal rail with packet */}
          <div ref={railRef} className="relative hidden sm:block">
            <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-line-strong" />
            {/* One element sweeping on the compositor; `alternate` gives the
                request/response ping-pong without a second animation or a
                remount, and `onAnimationIteration` is one state update per
                1.7s - enough to drive the caption, not enough to matter. */}
            {animate ? (
              <div
                aria-hidden
                className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 h-0"
              >
                <div
                  className="packet-sweep relative w-full"
                  onAnimationIteration={() =>
                    setPhase((p) => (p === "request" ? "response" : "request"))
                  }
                >
                  <span className="absolute -top-[3px] left-0 block h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
              </div>
            ) : null}
            <ol className="relative grid grid-cols-4">
              {nodes.map((n, i) => (
                <li key={n.id} className="relative flex flex-col items-center px-2 text-center">
                  <NodeButton node={n} orientation="desktop" tt={tt} facts={tt.raw(`facts.${n.id}`) as string[]} />
                  {i < nodes.length - 1 ? (
                    <span className="absolute -top-1 left-full z-10 -translate-x-1/2 whitespace-nowrap bg-surface px-1.5 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
                      {linkLabels[i]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {/* Packet caption. Under reduced motion there is no packet, so the
              caption stops asserting a direction and simply names both. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line pt-5 font-mono text-[length:var(--text-meta)] text-text-secondary">
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  !animate || phase === "request" ? "bg-accent" : "bg-line-strong",
                )}
              />
              {tt("requestLabel")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  !animate || phase === "response" ? "bg-accent" : "bg-line-strong",
                )}
              />
              {tt("responseLabel")}
            </span>
          </div>

          <Disclosure label={tt("protocolDetails")} className="mt-5">
            <dl className="grid gap-x-8 gap-y-1 font-mono text-[length:var(--text-meta)] sm:grid-cols-2">
              {[
                ["UDP 13400", tt("wire.udp")],
                ["TCP 13400", tt("wire.tcp")],
                [tt("routingLabel"), tt("wire.routing")],
                [tt("wireTerms.identifierRead"), tt("wire.read")],
                [tt("wireTerms.dtcRead"), tt("wire.dtc")],
                ["ISO 13400 / 14229", tt("wire.standards")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line py-1.5">
                  <dt className="text-text-primary">{k}</dt>
                  <dd className="text-right text-text-secondary">{v}</dd>
                </div>
              ))}
            </dl>
          </Disclosure>

          {/* The hardware chain, merged in from its own section. The two used to
              sit 12,000px apart on the home page both saying "a passive cable is
              all you need"; this is one section making that argument once. */}
          <div className="mt-10 grid items-start gap-8 border-t border-line pt-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div>
              <h3 className="text-[length:var(--text-title)] leading-tight">{th("title")}</h3>
              <ol className="mt-5 overflow-hidden rounded-sm border border-line">
                {chainKeys.map((c, i) => (
                  <li
                    key={c}
                    className="flex items-center gap-4 border-b border-line bg-surface px-5 py-3.5 last:border-0"
                  >
                    <span className="tnum w-5 font-mono text-[length:var(--text-meta)] text-text-muted">
                      {i + 1}
                    </span>
                    <span className="text-[length:var(--text-body)] text-text-primary">
                      {th(`chain.${c}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:pt-11">
              <p className="text-[length:var(--text-body)] leading-relaxed text-text-secondary">
                {th("lead")}
              </p>
              <ul className="mt-5 space-y-2.5">
                {notWantedKeys.map((n) => (
                  <li
                    key={n}
                    className="flex items-start gap-2.5 text-[length:var(--text-body)] leading-relaxed text-text-secondary"
                  >
                    <span aria-hidden className="mt-[0.5em] h-px w-3 shrink-0 bg-line-strong" />
                    {th(`notWanted.${n}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <MoreLink href="/docs/connection">{th("connectionGuide")}</MoreLink>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function NodeButton({
  node,
  orientation,
  tt,
  facts,
}: {
  node: Node;
  orientation: "desktop" | "mobile";
  tt: (k: string) => string;
  facts: string[];
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  const Icon = node.icon;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
            orientation === "mobile" ? "flex items-center gap-4 py-1" : "flex flex-col items-center",
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border bg-surface text-text-secondary transition-colors",
              open ? "border-accent text-text-primary" : "border-line-strong group-hover:border-text-primary",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <span className={orientation === "desktop" ? "mt-3" : undefined}>
            <span className="block text-[length:var(--text-body)] font-medium text-text-primary">
              {tt(`nodes.${node.id}Label`)}
            </span>
            <span className="block font-mono text-[length:var(--text-micro)] text-text-muted">
              {tt(`nodes.${node.id}Sub`)}
            </span>
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="center"
          className="z-50 w-56 rounded-sm border border-line-strong bg-surface p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
          asChild
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.fast, ease: EASE.out }}
          >
            <div className="font-mono text-[length:var(--text-meta)] text-text-primary">{tt(`nodes.${node.id}Label`)}</div>
            <ul className="mt-2 space-y-1 text-[length:var(--text-meta)] text-text-secondary">
              {facts.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className="mt-[0.55em] h-px w-2 shrink-0 bg-line-strong" />
                  {f}
                </li>
              ))}
            </ul>
            <Popover.Arrow className="fill-[var(--line-strong)]" />
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
