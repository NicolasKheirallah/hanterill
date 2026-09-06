import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/cn";

const LANG_LABEL: Record<string, string> = {
  rust: "Rust",
  ts: "TypeScript",
  tsx: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  text: "Text",
};

type Props = {
  code: string;
  lang?: string;
  className?: string;
  filename?: string;
};

/**
 * Build-time syntax highlighting. Shiki emits both light and dark colours;
 * globals.css swaps to the dark set under the dark theme. Flat, not a rounded
 * terminal card: a hairline border and a thin header with a copy button.
 */
export async function Code({ code, lang = "text", className, filename }: Props) {
  const trimmed = code.trim();
  const supported = new Set(["rust", "ts", "tsx", "typescript", "js", "javascript", "json", "bash", "sh", "shell", "text", "toml", "yaml", "diff"]);
  const safeLang = supported.has(lang) ? lang : "text";
  const html = await codeToHtml(trimmed, {
    lang: safeLang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div className={cn("min-w-0 overflow-hidden rounded-md border border-line bg-surface", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] text-text-muted">
          {filename ?? LANG_LABEL[safeLang] ?? safeLang}
        </span>
        <CopyButton text={trimmed} className="border-0 bg-transparent px-1" />
      </div>
      <div
        className="shiki-block overflow-x-auto p-4 text-[13px] leading-relaxed [&_pre]:bg-transparent! [&_pre]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
