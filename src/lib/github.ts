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
  assets: ReleaseAsset[];
};

export type RepoMeta = {
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  pushedAt: string | null;
  url: string;
};

const API = "https://api.github.com";
const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "opencma-website" };

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
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
    assets: { name: string; size: number; browser_download_url: string }[];
  }>(`/repos/${site.repo}/releases/latest`);
  if (!data) return null;
  return {
    version: data.tag_name,
    name: data.name || data.tag_name,
    url: data.html_url,
    publishedAt: data.published_at,
    assets: (data.assets ?? []).map((a) => ({
      name: a.name,
      size: a.size,
      downloadUrl: a.browser_download_url,
    })),
  };
}

export async function getRepoMeta(): Promise<RepoMeta | null> {
  const data = await getJson<{
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    license: { spdx_id: string | null } | null;
    pushed_at: string | null;
    html_url: string;
  }>(`/repos/${site.repo}`);
  if (!data) return null;
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    license: data.license?.spdx_id ?? null,
    pushedAt: data.pushed_at,
    url: data.html_url,
  };
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
