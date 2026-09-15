import type { ReactNode } from "react";

/**
 * Renders the Markdown subset GitHub release bodies use - headings, flat
 * lists, paragraphs, bold, code spans and links - as React elements. Not a
 * general Markdown parser: it only ever sees our own release notes, and
 * building elements (never raw HTML) keeps the output safe by construction.
 */

type Block =
  | { kind: "heading"; level: 3 | 4; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "paragraph"; text: string };

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s)<>"]+)/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [raw, code, bold, link, url] = match;
    const key = String(match.index);
    if (code) {
      out.push(<code key={key}>{code.slice(1, -1)}</code>);
    } else if (bold) {
      out.push(<strong key={key}>{bold.slice(2, -2)}</strong>);
    } else if (link) {
      const at = link.indexOf("](");
      out.push(
        <a key={key} href={link.slice(at + 2, -1)} target="_blank" rel="noreferrer">
          {link.slice(1, at)}
        </a>,
      );
    } else if (url) {
      const href = url.replace(/[.,;:!?"']+$|\)+$/, "");
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {href}
        </a>,
      );
    }
    last = match.index + raw.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function blocks(body: string): Block[] {
  const cleaned = body
    .replace(/\r\n?/g, "\n")
    .replace(/<!--[\s\S]*?-->\n?/g, "")
    .trim();
  const out: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push({ kind: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (const line of cleaned.split("\n")) {
    const text = line.trim();
    if (!text) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(text);
    if (heading) {
      flushParagraph();
      flushList();
      out.push({
        kind: "heading",
        level: heading[1].length <= 2 ? 3 : 4,
        text: heading[2],
      });
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(text);
    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    const ordered = /^\d+[.)]\s+(.*)$/.exec(text);
    if (ordered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }
    flushList();
    paragraph.push(text.replace(/^>\s?/, ""));
  }
  flushParagraph();
  flushList();
  return out;
}

/**
 * Renders a GitHub release body as React elements with the site's typography.
 *
 * This module existed but had no call sites: the changelog page had grown its
 * own inline renderer that stripped every marker character and flattened the
 * whole body into paragraphs, so `# Changelog` rendered as a literal hash, a
 * `[0.2.0] - 2026-09-13` line rendered as literal brackets, and bullet lists
 * rendered as em-dash-prefixed lines at 13px. This one handles code spans,
 * bold, links and autolinks, and emits real headings and lists.
 */
/** Renders one block. Extracted so the head and the clamped tail share it. */
function renderBlock(block: Block, key: number): ReactNode {
  if (block.kind === "heading") {
    const Tag = block.level === 3 ? "h3" : "h4";
    return (
      <Tag
        key={key}
        className={
          block.level === 3
            ? "mt-6 text-[length:var(--text-title)] leading-tight text-text-primary first:mt-0"
            : "mt-5 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted"
        }
      >
        {inline(block.text)}
      </Tag>
    );
  }
  if (block.kind === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        key={key}
        className={
          block.ordered
            ? "mt-3 list-decimal space-y-1.5 pl-5 text-[length:var(--text-body)] leading-relaxed text-text-secondary marker:text-text-muted"
            : "mt-3 list-disc space-y-1.5 pl-5 text-[length:var(--text-body)] leading-relaxed text-text-secondary marker:text-text-muted"
        }
      >
        {block.items.map((item, j) => (
          <li
            key={j}
            className="[&>code]:rounded-xs [&>code]:bg-bg-secondary [&>code]:px-1 [&>code]:py-0.5 [&>code]:font-mono [&>code]:text-[0.9em]"
          >
            {inline(item)}
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <p
      key={key}
      className="mt-3 text-[length:var(--text-body)] leading-relaxed text-text-secondary [&>code]:rounded-xs [&>code]:bg-bg-secondary [&>code]:px-1 [&>code]:py-0.5 [&>code]:font-mono [&>code]:text-[0.9em] [&>a]:text-accent [&>a]:underline [&>a]:decoration-1 [&>a]:underline-offset-2 [&>a:hover]:text-accent-hover"
    >
      {inline(block.text)}
    </p>
  );
}

/**
 * `limit` clamps how many blocks render before the rest folds behind a
 * disclosure. A single release body can be the whole CHANGELOG.md - the 0.2.0
 * notes alone ran to 19,500px - so the list page shows the top of each release
 * and keeps the remainder one click away rather than one scroll away.
 */
export function ReleaseNotes({
  body,
  limit,
  moreLabel,
}: {
  body: string;
  limit?: number;
  moreLabel?: string;
}) {
  const all = blocks(body);
  const head = limit ? all.slice(0, limit) : all;
  const tail = limit ? all.slice(limit) : [];

  return (
    <div className="mt-4 max-w-[72ch]">
      {head.map(renderBlock)}
      {tail.length ? (
        <details className="group mt-5 border-t border-line pt-3 empty:hidden">
          <summary className="cursor-pointer font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted transition-colors hover:text-text-primary [&::-webkit-details-marker]:hidden">
            {moreLabel ?? `Show ${tail.length} more`}
          </summary>
          <div className="mt-3">{tail.map((b, i) => renderBlock(b, 1000 + i))}</div>
        </details>
      ) : null}
    </div>
  );
}
