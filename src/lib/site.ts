/**
 * Central site configuration. Every release / source link and the GitHub
 * API calls follow `repo`.
 */
export const site = {
  name: "Hanterill",
  tagline: "Vehicle diagnostics for Volvo and Polestar",
  description:
    "Vehicle diagnostics, battery health and live telemetry for supported Volvo and Polestar vehicles over DoIP and UDS. Local, private and cross-platform. Source-available, for private use.",
  url: "https://hanterill.org",
  repo: "NicolasKheirallah/hanterill",
  /**
   * License summary. The LICENSE file in the source repository is the source of
   * truth; this is the plain-language summary shown on the site. Hanterill is
   * source-available for personal, non-commercial use, not an OSI open-source
   * licence.
   */
  license: {
    short: "CC BY-NC-ND 4.0",
    line: "Hanterill is licensed CC BY-NC-ND 4.0: read, run and share it for personal, non-commercial use. No commercial use, and no distributing modified versions.",
  },
  get repoUrl() {
    return `https://github.com/${this.repo}`;
  },
  get releasesUrl() {
    return `https://github.com/${this.repo}/releases`;
  },
  /** This website's own repository, for "edit this page" links. */
  websiteRepo: "NicolasKheirallah/openCMA---Website",
  websiteBranch: "master",
  docEditUrl(slug: string) {
    return `https://github.com/${this.websiteRepo}/edit/${this.websiteBranch}/src/content/docs/${slug}.mdx`;
  },
} as const;

/** Other projects by the same author, shown on /projects. URLs derive from the repo slug. Copy lives in the `projects.<slug>` message namespace. */
export const otherProjects = [
  {
    slug: "hisingen",
    name: "Hisingen",
    repo: "NicolasKheirallah/Hisingen",
    get repoUrl() {
      return `https://github.com/${this.repo}`;
    },
    platform: "macOS",
    license: "MIT",
    image: "/assets/hisingen/menubar-dashboard.png",
    imageRatio: 591 / 757,
  },
] as const;

/** Primary nav. `key` resolves against the `nav` message namespace. */
export const nav = [
  { key: "features", href: "/features" },
  { key: "vehicles", href: "/vehicles" },
  { key: "network", href: "/network" },
  { key: "docs", href: "/docs" },
  { key: "changelog", href: "/changelog" },
  { key: "safety", href: "/safety" },
  { key: "screenshots", href: "/screenshots" },
  { key: "projects", href: "/projects" },
] as const;

/** Footer columns. `heading` and `key` resolve against `footer` / `footer.links`. */
export const footerNav = [
  {
    heading: "diagnostics",
    links: [
      { key: "batteryHealth", href: "/features/battery-health" },
      { key: "vehicleDiagnostics", href: "/features/vehicle-diagnostics" },
      { key: "liveData", href: "/features/live-data" },
      { key: "serviceFunctions", href: "/features/service-functions" },
      { key: "download", href: "/download" },
    ],
  },
  {
    heading: "developers",
    links: [
      { key: "documentation", href: "/docs" },
      { key: "architecture", href: "/docs/architecture" },
      { key: "network", href: "/network" },
      { key: "changelog", href: "/changelog" },
      { key: "releases", href: site.releasesUrl, external: true },
    ],
  },
  {
    heading: "project",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "safety", href: "/safety" },
      { key: "about", href: "/about" },
      { key: "projects", href: "/projects" },
      { key: "license", href: "/docs/license" },
    ],
  },
] as const;

export const platforms = [
  { id: "windows", label: "Windows", arch: "x64 & ARM64", artifact: "Hanterill-setup.exe / .msi", note: "Windows 10 and 11" },
  { id: "macos", label: "macOS", arch: "Apple silicon & Intel", artifact: "Hanterill.dmg", note: "Universal build" },
  { id: "linux", label: "Linux", arch: "x86_64 & ARM64", artifact: ".AppImage / .deb", note: "Ubuntu, Debian, Fedora, Arch" },
] as const;

export type PlatformId = (typeof platforms)[number]["id"];
