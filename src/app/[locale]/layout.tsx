import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollSentinel } from "@/components/layout/ScrollSentinel";
import { site } from "@/lib/site";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s | Hanterill` },
    description: t("description"),
    applicationName: "Hanterill",
    authors: [{ name: "Hanterill contributors" }],
    keywords: [
      "Volvo diagnostics",
      "Polestar diagnostics",
      "DoIP",
      "UDS",
      "ISO 13400",
      "ISO 14229",
      "BECM",
      "ENET cable",
      "source-available vehicle diagnostics",
    ],
    openGraph: {
      type: "website",
      url: `${site.url}/${locale}`,
      siteName: "Hanterill",
      title: t("title"),
      description: t("description"),
      locale: locale === "sv" ? "sv_SE" : "en",
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", sv: "/sv" },
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12151a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f2ee" },
  ],
};

// Runs before paint to stamp the stored theme on <html>, so there is no
// flash of the wrong palette. next/script beforeInteractive hoists this into
// <head> in the SSR HTML and does not re-run it on client navigation - a
// plain <script> in the JSX tree is not executed on the client (React 19).
const themeScript = `
(function () {
  try {
    var s = localStorage.getItem('hanterill-theme');
    if (s === 'dark' || s === 'light') document.documentElement.setAttribute('data-theme', s);
  } catch (e) {}
})();
`;

const ldJson = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Hanterill",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Vehicle diagnostics",
      operatingSystem: "Windows, macOS, Linux",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: site.description,
      url: site.url,
      isAccessibleForFree: true,
      license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    },
    {
      "@type": "SoftwareSourceCode",
      name: "Hanterill",
      codeRepository: site.repoUrl,
      programmingLanguage: ["Rust", "TypeScript"],
      runtimePlatform: "Tauri",
      license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      about: "DoIP and UDS vehicle diagnostics for Volvo and Polestar",
    },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geist.variable} ${plexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg-primary text-text-primary antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <NextIntlClientProvider>
          <ScrollSentinel />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-text-primary focus:px-4 focus:py-2 focus:text-bg-primary"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
