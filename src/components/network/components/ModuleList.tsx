import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DOMAINS, UNITS, type Domain, type Unit } from '../graph'

/* Peripheral units render last, after the nine functional domains. */
const GROUP_ORDER: Domain[] = [
  ...(Object.keys(DOMAINS) as Domain[]).filter((d) => d !== 'peripheral'),
  'peripheral',
]

function matches(u: Unit, needle: string) {
  if (!needle) return true
  return `${u.ref} ${u.name}`.toLowerCase().includes(needle)
}

/**
 * Phone list view for the explorer. The full graph fits a 390 px canvas only
 * by shrinking its labels past legibility, and the phone task is different
 * anyway: find a module, read its connections. This view is a searchable,
 * domain-grouped index over the same unit data; each row opens the same detail
 * drawer the diagram uses, with the pin table at full width. The diagram stays
 * available one toggle away.
 */
export default function ModuleList({
  selectedId,
  onPick,
}: {
  selectedId: string | null
  onPick: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((domain) => ({
        domain,
        units: UNITS.filter((u) => u.domain === domain && matches(u, needle)),
      })).filter((g) => g.units.length > 0),
    [needle],
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-(--line) bg-(--surface) px-3 py-2.5">
        <Search size={14} className="shrink-0 text-(--ink-3)" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${UNITS.length} units…`}
          aria-label="Search units by reference or name"
          className="h-9 w-full bg-transparent text-[length:var(--text-body)] text-(--ink) outline-none placeholder:text-(--ink-3)"
        />
      </div>

      {groups.map((g) => (
        <section key={g.domain} aria-label={DOMAINS[g.domain]}>
          <h2 className="micro sticky top-[3.4rem] z-10 border-b border-(--line) bg-(--surface-2) px-3 py-2">
            {DOMAINS[g.domain]}
          </h2>
          <ul className="divide-y divide-(--line)">
            {g.units.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => onPick(u.id)}
                  aria-pressed={selectedId === u.id}
                  className={`flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left transition-colors max-[880px]:min-h-12
                              ${selectedId === u.id ? 'bg-(--surface-2)' : 'hover:bg-(--surface-2)'}`}
                >
                  <span className="w-14 shrink-0 font-mono text-[length:var(--text-meta)] tabular-nums text-(--ink-3)">
                    {u.ref || '—'}
                  </span>
                  <span
                    className={`grow text-[length:var(--text-ui)] uppercase tracking-wide ${u.peripheral ? 'text-(--ink-2)' : 'text-(--ink)'}`}
                  >
                    {u.name}
                  </span>
                  {u.hasDetail ? (
                    <i title="Documented pin-out" className="size-1.5 shrink-0 rounded-full bg-(--ink-3)" />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {groups.length === 0 ? (
        <p role="status" className="px-3 py-10 text-center text-[length:var(--text-ui)] text-(--ink-2)">
          No unit matches “{q}”.
        </p>
      ) : null}

      <p className="px-3 py-4 text-[length:var(--text-micro)] leading-relaxed text-(--ink-3)">
        Tap a unit for its connections and pin-out. The dot marks a documented pin-out;
        dashed details are inferred. The diagram view keeps the full map.
      </p>
    </div>
  )
}
