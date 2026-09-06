import { Star, GitFork, CircleDot } from "lucide-react";
import { getRepoMeta } from "@/lib/github";
import { site } from "@/lib/site";
import { MoreLink } from "@/components/ui/layout";

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export async function GitHubStats() {
  const meta = await getRepoMeta();

  if (!meta) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 text-[13px] text-text-secondary">
        Live repository stats are unavailable right now.{" "}
        <MoreLink href={site.repoUrl} external>
          Open the repository
        </MoreLink>
      </div>
    );
  }

  const items = [
    { icon: Star, label: "Stars", value: fmt(meta.stars) },
    { icon: GitFork, label: "Forks", value: fmt(meta.forks) },
    { icon: CircleDot, label: "Open issues", value: fmt(meta.openIssues) },
  ];

  return (
    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="bg-surface px-4 py-4">
            <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {it.label}
            </dt>
            <dd className="tnum mt-2 font-mono text-[20px] text-text-primary">{it.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
