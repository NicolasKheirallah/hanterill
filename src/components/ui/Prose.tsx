import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Long-form text column. Tokenised so it holds up in both themes. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-[68ch] text-[16px] leading-relaxed text-text-secondary",
        "[&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-text-primary [&_h2]:scroll-mt-24",
        "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-text-primary [&_h3]:scroll-mt-24",
        "[&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_li]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_a]:text-accent [&_a:hover]:text-accent-hover [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-medium [&_strong]:text-text-primary",
        "[&_code]:rounded-[3px] [&_code]:border [&_code]:border-line [&_code]:bg-bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
        "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-surface [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px]",
        "[&_th]:border-b [&_th]:border-line-strong [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-medium [&_th]:text-text-primary",
        "[&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-line-strong [&_blockquote]:pl-4 [&_blockquote]:text-text-secondary",
        "[&_hr]:my-10 [&_hr]:border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}
