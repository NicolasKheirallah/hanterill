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

export function matchAssetForPlatform(assets: ReleaseAsset[], platformId: string): ReleaseAsset | null {
  const rules: Record<string, RegExp> = {
    windows: /\.(exe|msi)$|windows|win/i,
    macos: /\.dmg$|mac|darwin|apple/i,
    linux: /\.(appimage|deb|rpm|tar\.gz)$|linux/i,
  };
  const rule = rules[platformId];
  if (!rule) return null;
  return assets.find((a) => rule.test(a.name)) ?? null;
}
