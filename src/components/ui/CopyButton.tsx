"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable, no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-sm border border-line bg-surface px-2 font-mono text-[11px] text-text-muted transition-colors hover:text-text-primary",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-status-ok" strokeWidth={2} /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} /> Copy
        </>
      )}
    </button>
  );
}
