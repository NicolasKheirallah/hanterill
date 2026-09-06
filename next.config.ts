import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: { root: process.cwd() },
};

// Scoped view transitions were trialled (React 19.2 addTransitionType) and
// pulled: Next 16.3.4 has no experimental.viewTransition flag, so the auto-VT
// on router navigation could not be verified across browsers and risked
// wedging the locale switch. Revisit on a Next upgrade that ships the flag.
// See PREMIUM-PASS.md section 4.4.

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
