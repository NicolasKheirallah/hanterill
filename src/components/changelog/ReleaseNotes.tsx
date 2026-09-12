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

export function ReleaseNotes({ body }: { body: string }) {
  return (
    <>
      {blocks(body).map((block, i) => {
        if (block.kind === "heading") {
          const Tag = block.level === 3 ? "h3" : "h4";
          return <Tag key={i}>{inline(block.text)}</Tag>;
        }
        if (block.kind === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{inline(block.text)}</p>;
      })}
    </>
  );
}
