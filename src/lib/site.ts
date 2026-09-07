/**
 * Central site configuration. The GitHub slug is a placeholder: swap
 * `repo` for the real `owner/name` and every release / source link and
 * the GitHub API calls follow.
 */
export const site = {
  name: "Hanterill",
  tagline: "Vehicle diagnostics for Volvo and Polestar",
  description:
    "Vehicle diagnostics, battery health and live telemetry for supported Volvo and Polestar vehicles over DoIP and UDS. Local, private and cross-platform. Source-available, for private use.",
  url: "https://hanterill.org",
  repo: "nicolaskheirallah/hanterill", // placeholder owner/name
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
  docsRepoPath: "https://github.com/nicolaskheirallah/hanterill/tree/main/docs",
} as const;

/** Other projects by the same author, shown on /projects. */
export const otherProjects = [
  {
    name: "Hisingen",
    repoUrl: "https://github.com/NicolasKheirallah/Hisingen",
    platform: "macOS",
    license: "MIT",
    image: "/assets/hisingen/menubar-dashboard.png",
    imageRatio: 591 / 757,
    tagline: "Polestar and Volvo telemetry in the macOS menu bar.",
    description:
      "Battery state of charge, range, charging power, latch states, climate preconditioning and diagnostic history, native in the menu bar. Built with AppKit and SwiftUI — no Electron, no telemetry middlemen, no cloud database between you and your vehicle.",
    highlights: [
      "Battery, range and charging status at a glance",
      "Remote climate, lock and charging controls",
      "Charging history with cost tracking and CSV export",
      "Native AppKit and SwiftUI, MIT-licensed",
    ],
  },
] as const;

/** Primary nav. `key` resolves against the `nav` message namespace. */
export const nav = [
  { key: "features", href: "/features" },
  { key: "vehicles", href: "/vehicles" },
  { key: "docs", href: "/docs" },
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
      { key: "projects", href: "/projects" },
      { key: "license", href: "/docs/license" },
    ],
  },
] as const;

export const platforms = [
  { id: "windows", label: "Windows", arch: "x64", artifact: "Hanterill-x64-setup.exe", note: "Windows 10 and 11" },
  { id: "macos", label: "macOS", arch: "Apple silicon / Intel", artifact: "Hanterill.dmg", note: "macOS 12 Monterey or later" },
  { id: "linux", label: "Linux", arch: "x86_64", artifact: "Hanterill.AppImage", note: "AppImage, glibc 2.31 or later" },
] as const;

export type PlatformId = (typeof platforms)[number]["id"];
