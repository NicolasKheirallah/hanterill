import Link from "next/link";
import "./globals.css";

/**
 * The one 404 the static export emits. Every unmatched path on the host lands
 * here, so it has to stand on its own: it carries its own `<html>`/`<body>`,
 * its own document title (it used to have none, so the browser tab was blank),
 * the theme bootstrap so a stored light preference is honoured, and real
 * destinations rather than a dead end.
 *
 * It cannot use the site Header/Footer components - those need the locale
 * segment and the next-intl provider, and this file renders outside both. The
 * small inline script reads the path prefix instead and points the links at the
 * locale the visitor was actually using, so a mistyped `/sv/...` URL does not
 * dump a Swedish reader into English.
 */
export const metadata = {
  title: "No route to that page | Hanterill",
  description:
    "That address did not resolve. The page may have moved with a release. Links to the documentation, supported vehicles and downloads are below.",
  robots: { index: false, follow: false },
};

const DESTINATIONS = [
  { path: "", en: "Home", sv: "Hem" },
  { path: "docs", en: "Documentation", sv: "Dokumentation" },
  { path: "vehicles", en: "Supported vehicles", sv: "Stödda fordon" },
  { path: "download", en: "Download", sv: "Ladda ner" },
  { path: "safety", en: "Safety", sv: "Säkerhet" },
] as const;

const themeScript = `
(function () {
  try {
    var s = localStorage.getItem('hanterill-theme');
    if (s === 'dark' || s === 'light') document.documentElement.setAttribute('data-theme', s);
  } catch (e) {}
  var seg = location.pathname.split('/')[1];
  var loc = seg === 'sv' ? 'sv' : 'en';
  document.documentElement.lang = loc;
  document.documentElement.setAttribute('data-404-locale', loc);
})();
`;

const linkScript = `
(function () {
  var loc = document.documentElement.getAttribute('data-404-locale') || 'en';
  document.querySelectorAll('[data-404-link]').forEach(function (a) {
    var p = a.getAttribute('data-404-path');
    var label = a.getAttribute('data-404-' + loc);
    a.setAttribute('href', '/' + loc + (p ? '/' + p : '/'));
    if (label) a.textContent = label;
  });
  document.querySelectorAll('[data-404-locale-link]').forEach(function (a) {
    var p = a.getAttribute('data-404-path');
    var target = a.getAttribute('data-404-locale-link');
    a.setAttribute('href', '/' + target + (p ? '/' + p : '/'));
  });
  var other = loc === 'sv' ? 'en' : 'sv';
  var el = document.querySelector('[data-404-other-locale]');
  if (el) el.textContent = other === 'sv' ? 'Svenska' : 'English';
})();
`;

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg-primary text-text-primary antialiased">
        <script dangerouslySetInnerHTML={{ __html: linkScript }} />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-5 py-2xl sm:px-8">
          <p className="font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
            Error 404
          </p>
          <h1 className="mt-4 max-w-[16ch] text-[length:var(--text-display)] leading-[1.03]">
            No route to that page.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[length:var(--text-prose)] leading-relaxed text-text-secondary">
            The address did not resolve. The page may have moved with a release.
          </p>

          <nav aria-label="Useful pages" className="mt-10">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {DESTINATIONS.map((d) => (
                <li key={d.path}>
                  <Link
                    href={`/en${d.path ? `/${d.path}` : ""}/`}
                    data-404-link
                    data-404-path={d.path}
                    data-404-en={d.en}
                    data-404-sv={d.sv}
                    className="group inline-flex items-center gap-1 text-[length:var(--text-body)] font-medium text-accent transition-colors hover:text-accent-hover"
                  >
                    <span className="rule-link">{d.en}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-12 border-t border-line pt-6 font-mono text-[length:var(--text-micro)] uppercase tracking-[length:var(--track-label)] text-text-muted">
            {/* A raw anchor on purpose: this file renders outside the locale
                segment, so there is no next-intl Link context to use, and the
                href is rewritten client-side from the visitor's own path
                prefix. The lint rule cannot see that. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/sv/"
              data-404-locale-link="sv"
              data-404-path=""
              className="rule-link text-text-secondary hover:text-text-primary"
            >
              <span data-404-other-locale>Svenska</span>
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
