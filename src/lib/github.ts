import { site } from "@/lib/site";

export type ReleaseAsset = {
  name: string;
  size: number;
  downloadUrl: string;
};

export type Release = {
  version: string;
  name: string;
  url: string;
  publishedAt: string | null;
  /** GitHub release body (Markdown subset). Empty for tag-only releases. */
  body: string;
  prerelease: boolean;
  assets: ReleaseAsset[];
};

const API = "https://api.github.com";
const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "hanterill-website" };

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network failure, timeout, rate limit, invalid JSON: the site
    // renders its offline fallback instead of failing.
    return null;
  }
}

export async function getLatestRelease(): Promise<Release | null> {
  const data = await getJson<{
    tag_name: string;
    name: string;
    html_url: string;
    published_at: string | null;
    body: string | null;
    prerelease: boolean;
    assets: { name: string; size: number; browser_download_url: string }[];
  }>(`/repos/${site.repo}/releases/latest`);
  if (!data) return null;
  return {
    version: data.tag_name,
    name: data.name || data.tag_name,
    url: data.html_url,
    publishedAt: data.published_at,
    body: data.body ?? "",
    prerelease: data.prerelease,
    assets: (data.assets ?? []).map((a) => ({
      name: a.name,
      size: a.size,
      downloadUrl: a.browser_download_url,
    })),
  };
}

/** Published releases, newest first. Drafts are not public; prereleases are. */
export async function getReleases(limit = 30): Promise<Release[]> {
  const data = await getJson<
    {
      tag_name: string;
      name: string | null;
      html_url: string;
      published_at: string | null;
      body: string | null;
      prerelease: boolean;
      assets: { name: string; size: number; browser_download_url: string }[];
    }[]
  >(`/repos/${site.repo}/releases?per_page=${limit}`);
  if (!data) return [];
  return data.map((r) => ({
    version: r.tag_name,
    name: r.name || r.tag_name,
    url: r.html_url,
    publishedAt: r.published_at,
    body: r.body ?? "",
    prerelease: r.prerelease,
    assets: (r.assets ?? []).map((a) => ({
      name: a.name,
      size: a.size,
      downloadUrl: a.browser_download_url,
    })),
  }));
}

/** Source tags. Published releases can lag tags; the releases page shows both. */
export async function getTags(limit = 12): Promise<string[]> {
  const data = await getJson<{ ref: string }[]>(
    `/repos/${site.repo}/git/matching-refs/tags/v?per_page=${limit}`,
  );
  if (!data) return [];
  return data.map((d) => d.ref.replace("refs/tags/", "")).reverse();
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export type OsId = "windows" | "macos" | "linux";

const OS_RULES: Record<OsId, RegExp> = {
  windows: /\.(exe|msi)$|windows|win/i,
  macos: /\.dmg$|mac|darwin|apple/i,
  linux: /\.(appimage|deb|rpm|tar\.gz)$|linux/i,
};

/** Every released build for one OS, most common architecture first. */
export function assetsForPlatform(assets: ReleaseAsset[], platformId: string): ReleaseAsset[] {
  const rule = OS_RULES[platformId as OsId];
  if (!rule) return [];
  const matched = assets.filter((a) => rule.test(a.name));
  const order = ARCH_PRIORITY[platformId as OsId] ?? [];
  return matched.sort(
    (a, b) => archRank(a.name, order) - archRank(b.name, order),
  );
}

const ARCH_PRIORITY: Record<OsId, string[]> = {
  macos: ["aarch64", "arm64", "x86_64", "amd64", "x64", "universal"],
  windows: ["x64", "amd64", "x86_64", "arm64", "aarch64"],
  linux: ["amd64", "x86_64", "x64", "arm64", "aarch64"],
};

function archRank(name: string, order: string[]): number {
  const lower = name.toLowerCase();
  const i = order.findIndex((arch) => lower.includes(arch));
  return i === -1 ? order.length : i;
}

/**
 * Plain-language architecture for one asset filename, e.g. "aarch64.dmg" ->
 * "Apple silicon". Returns null when the name names no architecture; callers
 * fall back to the bare filename so the panel never invents a label. These are
 * hardware names, not copy: they render in mono and carry no translation.
 */
export function assetArchLabel(name: string, platformId: string): string | null {
  const lower = name.toLowerCase();
  if (platformId === "macos") {
    return /aarch64|arm64/.test(lower)
      ? "Apple silicon"
      : /x86_64|amd64|x64/.test(lower)
        ? "Intel"
        : /universal/.test(lower)
          ? "Universal"
          : null;
  }
  if (/aarch64|arm64/.test(lower)) return "ARM64";
  if (/x86_64|amd64|x64/.test(lower)) return platformId === "windows" ? "64-bit" : "x86_64";
  return null;
}

/** File-format tag from the asset name: ".dmg", ".exe", ".deb", ".tar.gz". */
export function assetFormat(name: string): string {
  if (/\.tar\.gz$/i.test(name)) return ".tar.gz";
  const m = name.match(/(\.[a-z]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

/** The visitor's CPU family where the browser reports one. Null when it does not. */
export async function detectArch(): Promise<"arm" | "x86" | null> {
  if (typeof navigator === "undefined") return null;
  const uad = (navigator as Navigator & {
    userAgentData?: { getHighEntropyValue?: (keys: string[]) => Promise<{ architecture?: string }> };
  }).userAgentData;
  if (!uad?.getHighEntropyValue) return null;
  try {
    const { architecture } = await uad.getHighEntropyValue(["architecture"]);
    if (architecture === "arm") return "arm";
    if (architecture === "x86") return "x86";
  } catch {
    // Chrome without the hint, or a denied call: no highlight.
  }
  return null;
}

/** Does an asset filename match the detected CPU family? */
export function archMatches(name: string, arch: "arm" | "x86"): boolean {
  const lower = name.toLowerCase();
  return arch === "arm" ? /aarch64|arm64/.test(lower) : /x86_64|amd64|x64/.test(lower);
}
