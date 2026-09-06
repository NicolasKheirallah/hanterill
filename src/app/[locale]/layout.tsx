import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollSentinel } from "@/components/layout/ScrollSentinel";
import { site } from "@/lib/site";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
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
    title: { default: t("title"), template: `%s | openCMA` },
    description: t("description"),
    applicationName: "openCMA",
    authors: [{ name: "openCMA contributors" }],
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
      siteName: "openCMA",
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
    { media: "(prefers-color-scheme: light)", color: "#f5f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#111211" },
  ],
};

const themeScript = `
(function () {
  try {
    var s = localStorage.getItem('opencma-theme');
    if (s === 'dark' || s === 'light') document.documentElement.setAttribute('data-theme', s);
  } catch (e) {}
})();
`;

const ldJson = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "openCMA",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Vehicle diagnostics",
      operatingSystem: "Windows, macOS, Linux",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: site.description,
      url: site.url,
      isAccessibleForFree: true,
      license: `${site.repoUrl}/blob/main/LICENSE`,
    },
    {
      "@type": "SoftwareSourceCode",
      name: "openCMA",
      codeRepository: site.repoUrl,
      programmingLanguage: ["Rust", "TypeScript"],
      runtimePlatform: "Tauri",
      license: `${site.repoUrl}/blob/main/LICENSE`,
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
      className={`${inter.variable} ${plexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg-primary text-text-primary antialiased">
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
