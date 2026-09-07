/**
 * Central site configuration. The GitHub slug is a placeholder: swap
 * `repo` for the real `owner/name` and every release / source link and
 * the GitHub API calls follow.
 */
export const site = {
  name: "openCMA",
  tagline: "Vehicle diagnostics for Volvo and Polestar",
  description:
    "Vehicle diagnostics, battery health and live telemetry for supported Volvo and Polestar vehicles over DoIP and UDS. Local, private and cross-platform. Source-available, for private use.",
  url: "https://opencma.org",
  repo: "opencma/opencma", // placeholder owner/name
  /**
   * License summary. The LICENSE file in the source repository is the source of
   * truth; this is the plain-language summary shown on the site. openCMA is
   * source-available for personal, non-commercial use, not an OSI open-source
   * licence.
   */
  license: {
    short: "Private use only",
    line: "openCMA is provided for personal, non-commercial use under the project license.",
  },
  get repoUrl() {
    return `https://github.com/${this.repo}`;
  },
  get releasesUrl() {
    return `https://github.com/${this.repo}/releases`;
  },
  docsRepoPath: "https://github.com/opencma/opencma/tree/main/docs",
} as const;

/** Primary nav. `key` resolves against the `nav` message namespace. */
export const nav = [
  { key: "features", href: "/features" },
  { key: "vehicles", href: "/vehicles" },
  { key: "docs", href: "/docs" },
  { key: "safety", href: "/safety" },
  { key: "screenshots", href: "/screenshots" },
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
      { key: "source", href: site.repoUrl, external: true },
      { key: "buildFromSource", href: "/docs/development" },
    ],
  },
  {
    heading: "project",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "safety", href: "/safety" },
      { key: "about", href: "/about" },
      { key: "license", href: "/docs/license" },
    ],
  },
] as const;

export const platforms = [
  { id: "windows", label: "Windows", arch: "x64", artifact: "openCMA-x64-setup.exe", note: "Windows 10 and 11" },
  { id: "macos", label: "macOS", arch: "Apple silicon / Intel", artifact: "openCMA.dmg", note: "macOS 12 Monterey or later" },
  { id: "linux", label: "Linux", arch: "x86_64", artifact: "openCMA.AppImage", note: "AppImage, glibc 2.31 or later" },
] as const;

export type PlatformId = (typeof platforms)[number]["id"];
