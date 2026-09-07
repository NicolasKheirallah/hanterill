import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

// The locale lives in the URL on every real page (`localePrefix: "always"`), so
// "/" itself renders nothing. The next-intl middleware used to redirect it to
// the negotiated locale; a static export has no middleware, so this is a
// prerendered `index.html` that bounces to the default locale instead.
//
// The target is relative (`./en/`) on purpose: it resolves to `/en/` on a bare
// domain and `/<repo>/en/` under a GitHub Pages base path, with no build-time
// knowledge of which one is in effect.
const target = `./${routing.defaultLocale}/`;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootRedirect() {
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <link rel="canonical" href={`https://opencma.org/${routing.defaultLocale}/`} />
        <script
          // Faster than waiting for the meta refresh, and replaces the entry so
          // Back does not land on this bounce page.
          dangerouslySetInnerHTML={{
            __html: `location.replace(${JSON.stringify(target)}+location.search+location.hash)`,
          }}
        />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", margin: "2rem" }}>
        <p>
          Redirecting to <a href={target}>openCMA</a>.
        </p>
      </body>
    </html>
  );
}
