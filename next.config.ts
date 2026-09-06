import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: { root: process.cwd() },
};

// View transitions are implemented at the DOM level (document.startViewTransition
// in LocaleSwitcher and DocNavLink), scoped to the locale switch and docs
// previous/next only. Next 16.3.4 has no experimental.viewTransition flag, so
// there is no framework auto-wrap: the effect is a progressive enhancement,
// instant where the API or timing does not cooperate, and disabled under
// reduced motion in globals.css. Revisit the framework flag on a Next upgrade
// that ships it.

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
