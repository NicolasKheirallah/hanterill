"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const t = useTranslations("docs");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  function copy() {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current ?? undefined);
        timer.current = setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // clipboard unavailable, no-op
      });
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t("copied") : t("copy")}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 font-mono text-[11px] text-text-muted transition-colors hover:text-text-primary",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-status-ok" strokeWidth={2} /> {t("copied")}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} /> {t("copy")}
        </>
      )}
    </button>
  );
}
