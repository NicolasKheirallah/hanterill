import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

// A GitHub Pages project site serves from `https://<user>.github.io/<repo>/`, so
// the build needs that repo path as a prefix. A user site or a custom domain
// (opencma.org) serves from `/` and needs none. The deploy workflow passes the
// right value in; local builds get "".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: { root: process.cwd() },

  // Static HTML/CSS/JS only: no middleware, no ISR, no image optimisation, no
  // Route Handlers that read the request. src/proxy.ts is gone and src/app/
  // page.tsx now does the `/` -> `/en` redirect the middleware used to.
  output: "export",

  // GitHub Pages resolves "/docs/" to "/docs/index.html". Trailing slashes keep
  // every internal link pointing at a directory that actually exists on disk.
  trailingSlash: true,

  // `next/image` optimisation needs a server; emit the source images untouched.
  images: { unoptimized: true },

  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  // Next 16 blocks cross-origin requests to dev-only resources (HMR, fonts,
  // the RSC runtime) for any origin other than localhost. Without this, the
  // page loads but never hydrates when opened from the LAN IP or a VM, so
  // nothing is interactive. Covers Wi-Fi and both VMware host-only subnets.
  allowedDevOrigins: ["192.168.0.*", "192.168.244.*", "192.168.153.*"],
};

// Scoped view transitions were trialled (React 19.2 addTransitionType) and
// pulled: Next 16.3.4 has no experimental.viewTransition flag, so the auto-VT
// on router navigation could not be verified across browsers and risked
// wedging the locale switch. Revisit on a Next upgrade that ships the flag.

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
