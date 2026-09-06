import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
};

// The real <html>/<body> live in app/[locale]/layout.tsx so the lang attribute
// can follow the active locale. This root only exists because Next requires it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
