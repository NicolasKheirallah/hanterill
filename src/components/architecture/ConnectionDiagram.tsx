"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Car, Cable, Laptop, Gauge } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { Disclosure } from "@/components/ui/Disclosure";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Node = {
  id: "vehicle" | "enet" | "computer" | "opencma";
  icon: typeof Car;
};

const nodes: Node[] = [
  { id: "vehicle", icon: Car },
  { id: "enet", icon: Cable },
  { id: "computer", icon: Laptop },
  { id: "opencma", icon: Gauge },
];

export function ConnectionDiagram() {
  const reduce = useReducedMotion();
  const tt = useTranslations("connection");
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
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
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
            {animate ? (
              <motion.span
                aria-hidden
                key={phase}
                className="absolute top-5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
                style={{ marginLeft: "-3px" }}
                initial={{ left: phase === "request" ? "87.5%" : "12.5%", opacity: 0 }}
                animate={{ left: phase === "request" ? "12.5%" : "87.5%", opacity: [0, 1, 1, 1, 0] }}
                transition={{ duration: 1.7, ease: [0.65, 0, 0.35, 1], delay: 0.9 }}
                onAnimationComplete={() => setPhase((p) => (p === "request" ? "response" : "request"))}
              />
            ) : null}
            <ol className="relative grid grid-cols-4">
              {nodes.map((n, i) => (
                <li key={n.id} className="relative flex flex-col items-center px-2 text-center">
                  <NodeButton node={n} orientation="desktop" tt={tt} facts={tt.raw(`facts.${n.id}`) as string[]} />
                  {i < nodes.length - 1 ? (
                    <span className="absolute -top-1 left-full z-10 -translate-x-1/2 whitespace-nowrap bg-surface px-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {linkLabels[i]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {/* Packet caption */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line pt-5 font-mono text-[12px] text-text-secondary">
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", phase === "request" ? "bg-accent" : "bg-line-strong")} />
              {tt("requestLabel")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", phase === "response" ? "bg-accent" : "bg-line-strong")} />
              {tt("responseLabel")}
            </span>
          </div>

          <Disclosure label={tt("protocolDetails")} className="mt-5">
            <dl className="grid gap-x-8 gap-y-1 font-mono text-[12px] sm:grid-cols-2">
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
  const reduce = useReducedMotion();
  const Icon = node.icon;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group outline-none",
            orientation === "mobile" ? "flex items-center gap-4 py-1" : "flex flex-col items-center",
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border bg-surface text-text-secondary transition-colors",
              open ? "border-accent text-text-primary" : "border-line-strong group-hover:border-text-primary",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
          <span className={orientation === "desktop" ? "mt-3" : undefined}>
            <span className="block text-[14px] font-medium text-text-primary">
              {tt(`nodes.${node.id}Label`)}
            </span>
            <span className="block font-mono text-[11px] text-text-muted">
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
            <div className="font-mono text-[12px] text-text-primary">{tt(`nodes.${node.id}Label`)}</div>
            <ul className="mt-2 space-y-1 text-[12px] text-text-secondary">
              {facts.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className="mt-[7px] h-px w-2 shrink-0 bg-line-strong" />
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
