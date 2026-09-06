"use client";

import { useEffect, useRef } from "react";

/**
 * Toggles data-scrolled on <html> once the page has moved past the top,
 * so the header can gain its border and blur without a scroll listener.
 */
export function ScrollSentinel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.toggleAttribute("data-scrolled", !entry.isIntersecting);
      },
      { rootMargin: "0px 0px 0px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px" />;
}
