"use client";

import * as React from "react";
import { startTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type WithAddTransitionType = { unstable_addTransitionType?: (type: string) => void };
const addTransitionType = (React as WithAddTransitionType).unstable_addTransitionType;

/**
 * Docs previous / next link. A plain left-click navigates inside a React
 * transition tagged `doc-forward` or `doc-back`; React 19.2 starts the view
 * transition and globals.css slides the content region against the reading
 * direction. Modified clicks (new tab and so on) and no-JS fall back to the
 * plain href; reduced motion drops the slide (globals.css).
 */
export function DocNavLink({
  href,
  type,
  className,
  children,
}: {
  href: string;
  type: "doc-forward" | "doc-back";
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        startTransition(() => {
          addTransitionType?.(type);
          router.push(href);
        });
      }}
    >
      {children}
    </a>
  );
}
