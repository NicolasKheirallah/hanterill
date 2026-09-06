import type { MDXComponents } from "mdx/types";
import { Link } from "@/i18n/navigation";
import { Code } from "@/components/ui/Code";
import { Callout, SpecList } from "@/components/docs/DocData";

function textOf(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    SpecList,
    a: ({ href = "", children, ...rest }) => {
      const external = /^https?:\/\//.test(href);
      if (external) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...rest}>
            {children}
          </a>
        );
      }
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    },
    table: ({ children }) => (
      <div className="my-5 overflow-x-auto rounded-md border border-line">
        <table className="w-full border-collapse text-[14px] [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-line-strong [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-text-primary [&_tr:last-child_td]:border-0">
          {children}
        </table>
      </div>
    ),
    pre: ({ children }) => {
      const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
      const className = child?.props?.className ?? "";
      const lang = className.replace("language-", "") || "text";
      const code = textOf(child?.props?.children);
      return <Code code={code} lang={lang} className="my-5" />;
    },
    ...components,
  };
}
