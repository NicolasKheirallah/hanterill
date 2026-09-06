import type { PlatformId } from "@/lib/site";

export function detectPlatform(): PlatformId | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.platform || "").toLowerCase();
  if (/win/.test(ua) || /win/.test(plat)) return "windows";
  if (/mac/.test(ua) || /mac/.test(plat)) return "macos";
  if (/linux|x11|ubuntu|fedora/.test(ua) || /linux/.test(plat)) return "linux";
  return null;
}
