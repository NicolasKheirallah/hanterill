import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  X, Search, MapPin, Hash, Share2, ArrowLeft, Route, Waypoints,
  ChevronDown, ChevronRight, Radio,
} from 'lucide-react'
import {
  BUSES, RAW_EDGES, UNIT_BY_ID, UNITS, WIRE_COLORS,
  type Bus, type BusMessage, type ModuleDetail, type PinRow, type Segment, type Unit,
} from '../graph'
import modulesJson from '../data/modules.json'
import busesJson from '../data/buses.json'

const MODULES = modulesJson as unknown as Record<string, ModuleDetail>
const BUS_MESSAGES = busesJson as unknown as Record<string, BusMessage[]>
const REF_TO_UNIT = new Map(UNITS.filter((u) => u.ref).map((u) => [u.ref, u]))

export type DrawerSel =
  | { kind: 'unit'; unit: Unit }
  | { kind: 'segment'; segment: Segment }

function WireSwatch({ code }: { code: string }) {
  if (!code || code === '-') return <>{code}</>
  const parts = code.split('/').map((s) => s.trim())
  if (!parts.every((p) => WIRE_COLORS[p])) return <>{code}</>
  return (
    <span className="wire">
      <span className="sw">
        {parts.map((p, i) => <i key={i} style={{ background: WIRE_COLORS[p] }} />)}
      </span>
      {code}
    </span>
  )
}

function PinTable({
  pins, initialFilter, focusText, onRowClick, onNetClick,
}: {
  pins: PinRow[]
  initialFilter?: string
  focusText?: string | null
  onRowClick: (targetUnitId: string | null) => void
  onNetClick: (net: string) => void
}) {
  const [q, setQ] = useState(initialFilter ?? '')
  const bodyRef = useRef<HTMLTableSectionElement>(null)
  const reduce = useReducedMotion()

  // Global pin search: apply initial filter after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialFilter !== undefined) setQ(initialFilter)
  }, [initialFilter])
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return pins
    return pins.filter((p) => !p.sep && !p.section &&
      `${p.target} ${p.net} ${p.pin} ${p.note} ${p.color}`.toLowerCase().includes(needle))
  }, [pins, q])

  /* edge-click cross-reference: scroll to + flash the matching rows */
  useEffect(() => {
    if (!focusText || !bodyRef.current) return
    const needle = focusText.toLowerCase()
    const trs = [...bodyRef.current.querySelectorAll('tr[data-text]')]
    const hits = trs.filter((tr) => (tr.getAttribute('data-text') ?? '').includes(needle))
    if (!hits.length) return
    hits[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    for (const h of hits) {
      h.classList.add('flash')
      setTimeout(() => h.classList.remove('flash'), 2400)
    }
  }, [focusText, reduce])

  return (
    <div>
      <div className="flex items-center gap-2 border border-(--line) bg-(--surface-2) h-8 px-2.5 mb-2.5">
        <Search size={12} className="text-(--ink-2) shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter pins, nets, targets…"
          className="w-full bg-transparent text-xs outline-none text-(--ink) placeholder:text-(--ink-3)"
        />
      </div>
      <table className="pins">
        <thead>
          <tr><th>Target</th><th>Net</th><th>Pin</th><th>Wire</th><th>Notes</th></tr>
        </thead>
        <tbody ref={bodyRef}>
          {rows.map((p, i) => {
            if (p.sep) return q ? null : <tr key={i}><td colSpan={5} style={{ height: 4, padding: 0 }} /></tr>
            if (p.section) return q ? null : <tr key={i} className="sec"><td colSpan={5}>{p.section}</td></tr>
            const tref = (p.target?.match(/^\d+\/\d+/) || [''])[0]
            const targetUnit = tref ? REF_TO_UNIT.get(tref) ?? null : null
            return (
              <tr
                key={i}
                className={`b-${p.bus ?? ''} ${targetUnit ? 'clickable' : ''}`}
                data-text={`${p.target} ${p.net} ${p.note}`.toLowerCase()}
                title={targetUnit ? 'Highlight this connection on the diagram' : undefined}
                onClick={() => onRowClick(targetUnit?.id ?? null)}
              >
                <td>{p.target}</td>
                <td className="mut">
                  {p.net ? (
                    <button
                      className="netlink"
                      title={`Trace net ${p.net} across the whole harness`}
                      onClick={(ev) => { ev.stopPropagation(); onNetClick(p.net!) }}
                    >
                      {p.net}
                    </button>
                  ) : null}
                </td>
                <td className="pin">{p.pin}</td>
                <td><WireSwatch code={p.color ?? ''} /></td>
                <td className="mut">{p.note}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-7">
      <div className="micro mb-2.5 flex items-center gap-1.5">{icon}{title}</div>
      {children}
    </div>
  )
}

function UnitBody({
  unit, pinFilterInit, pinFocus, onSelect, onPinHighlight, onNetClick,
}: {
  unit: Unit
  pinFilterInit?: string
  pinFocus?: string | null
  onSelect: (id: string) => void
  onPinHighlight: (unitId: string | null) => void
  onNetClick: (net: string) => void
}) {
  const detail = unit.hasDetail ? MODULES[unit.id] : null

  const links = useMemo(() => RAW_EDGES
    .filter((e) => e.source === unit.id || e.target === unit.id)
    .map((e) => {
      const other = UNIT_BY_ID.get(e.source === unit.id ? e.target : e.source)
      return other ? { other, bus: e.bus as Bus, inferred: e.inferred } : null
    })
    .filter((x): x is NonNullable<typeof x> => !!x), [unit])

  const busMix = useMemo(() => {
    const m = new Map<Bus, number>()
    for (const l of links) m.set(l.bus, (m.get(l.bus) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [links])

  return (
    <>
      {busMix.length > 0 && (
        <Section title={`Network mix · ${links.length} links`} icon={<Share2 size={11} />}>
          <div className="flex h-2 w-full overflow-hidden border border-(--line)">
            {busMix.map(([bus, n]) => (
              <div key={bus} title={`${BUSES[bus].label}: ${n}`}
                style={{ width: `${(n / links.length) * 100}%`, background: BUSES[bus].color }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {busMix.map(([bus, n]) => (
              <span key={bus} className="inline-flex items-center gap-1.5 text-[10px] text-(--ink-2)">
                <i className="size-2 inline-block" style={{ background: BUSES[bus].color }} />
                {BUSES[bus].label} · {n}
              </span>
            ))}
          </div>
        </Section>
      )}

      {detail ? (
        <Section title={`Pin-out · ${detail.pins.filter((p) => !p.sep && !p.section).length} connections`}>
          <PinTable
            pins={detail.pins}
            initialFilter={pinFilterInit}
            focusText={pinFocus}
            onRowClick={onPinHighlight}
            onNetClick={onNetClick}
          />
        </Section>
      ) : (
        <Section title="Pin-out">
          <div className="border border-dashed border-(--line) p-4 text-xs leading-relaxed text-(--ink-2)">
            Pin-out detail for this unit hasn’t been documented yet — connections shown are
            derived from other modules’ pin-outs and the source block diagram.
          </div>
        </Section>
      )}

      {links.length > 0 && (
        <Section title="Connected units">
          <div className="flex flex-wrap gap-1.5">
            {[...new Map(links.map((l) => [l.other.id, l])).values()].map((l) => (
              <button
                key={l.other.id}
                onClick={() => onSelect(l.other.id)}
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 border border-(--line)
                           hover:border-(--accent) hover:text-(--accent) transition-colors text-left"
              >
                <i className="size-1.5 rounded-full shrink-0" style={{ background: BUSES[l.bus].color }} />
                {l.other.ref} {l.other.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {detail?.partNumber && (
        <Section title="Part number" icon={<Hash size={11} />}>
          <div className="text-sm font-semibold">{detail.partNumber}</div>
        </Section>
      )}
      {detail?.location && (
        <Section title="Location" icon={<MapPin size={11} />}>
          <div className="text-[13px] leading-relaxed">{detail.location.replace(/-$/, '')}</div>
        </Section>
      )}
    </>
  )
}

function MessageTable({ messages }: { messages: BusMessage[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return messages
    return messages.filter((m) => `${m.id} ${m.desc} ${m.extra} ${m.hex}`.toLowerCase().includes(needle))
  }, [messages, q])
  return (
    <div>
      <div className="flex items-center gap-2 border border-(--line) bg-(--surface-2) h-8 px-2.5 mb-2.5">
        <Search size={12} className="text-(--ink-2) shrink-0" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Filter message IDs, descriptions…"
          className="w-full bg-transparent text-xs outline-none text-(--ink) placeholder:text-(--ink-3)"
        />
      </div>
      <table className="pins">
        <thead><tr><th style={{ width: 60 }}>ID</th><th style={{ width: 28 }}>Len</th><th>Description</th><th style={{ width: 30 }} title="Approximate rate / contents">·</th></tr></thead>
        <tbody>
          {rows.map((m) => (
            <MsgRow key={m.id} m={m} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MsgRow({ m, open, onToggle }: { m: BusMessage; open: boolean; onToggle: () => void }) {
  const expandable = !!m.detail
  return (
    <>
      <tr className={expandable ? 'clickable' : ''} onClick={expandable ? onToggle : undefined}>
        <td className="pin">
          <span className="inline-flex items-center gap-1">
            {expandable && (open ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
            <b className="font-semibold">{m.id}</b>
          </span>
        </td>
        <td className="pin">{m.len}</td>
        <td className="mut">{m.desc || m.extra}</td>
        <td className="mut">{m.desc ? m.extra : ''}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={4} style={{ padding: '8px 8px 10px' }}>
            <div className="text-[10px] text-(--ink-3) mb-1.5 font-mono">{m.hex}</div>
            <pre className="msg-detail">{m.detail}</pre>
          </td>
        </tr>
      )}
    </>
  )
}

function SegmentBody({ segment, onSelect }: { segment: Segment; onSelect: (id: string) => void }) {
  const members = segment.members
    .map((id) => UNIT_BY_ID.get(id))
    .filter((u): u is Unit => !!u)
  const messages = BUS_MESSAGES[segment.id]
  return (
    <>
      <Section title="Bus segment" icon={<Waypoints size={11} />}>
        <div className="text-xs leading-relaxed text-(--ink-2)">
          Shared multi-drop {BUSES[segment.bus].label} segment — every unit below talks on the
          same pair of wires.
        </div>
        {(segment.speed || segment.wireH || segment.busModules) && (
          <div className="mt-3 flex flex-col gap-1.5 text-[11.5px]">
            {segment.speed && <div><span className="text-(--ink-3)">Speed</span> — <b>{segment.speed}</b></div>}
            {segment.wireH && (
              <div className="flex items-center gap-2">
                <span className="text-(--ink-3)">Wires</span> —
                <span className="inline-flex items-center gap-1.5">H <WireSwatch code={segment.wireH} /></span>
                {segment.wireL && <span className="inline-flex items-center gap-1.5">L <WireSwatch code={segment.wireL} /></span>}
              </div>
            )}
            {segment.busModules && <div><span className="text-(--ink-3)">On this bus</span> — {segment.busModules}</div>}
          </div>
        )}
      </Section>
      {members.length > 0 && (
        <Section title={`${members.length} drops`}>
          <div className="flex flex-col gap-1.5">
            {members.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelect(u.id)}
                className="flex items-center gap-2.5 text-[12px] px-3 py-2 border border-(--line)
                           hover:border-(--accent) hover:text-(--accent) transition-colors text-left"
              >
                <i className="size-1.5 rounded-full shrink-0" style={{ background: BUSES[segment.bus].color }} />
                <span className="text-(--ink-3) text-[10px] min-w-10 tabular-nums">{u.ref || '—'}</span>
                <span className="uppercase tracking-wide">{u.name}</span>
              </button>
            ))}
          </div>
        </Section>
      )}
      {messages && (
        <Section title={`Message database · ${messages.length} IDs`} icon={<Radio size={11} />}>
          <div className="text-[11px] text-(--ink-2) mb-2">
            Live-captured frames with reverse-engineered meanings. Click an ID for byte-level notes.
          </div>
          <MessageTable messages={messages} />
        </Section>
      )}
    </>
  )
}

export default function DetailDrawer({
  sel, onClose, onSelect, onBack, canBack, onTrace, pinFilterInit, pinFocus,
  onPinHighlight, onNetClick,
}: {
  sel: DrawerSel | null
  onClose: () => void
  onSelect: (id: string) => void
  onBack: () => void
  canBack: boolean
  onTrace: (fromId: string) => void
  pinFilterInit?: string
  pinFocus?: string | null
  onPinHighlight: (unitId: string | null) => void
  onNetClick: (net: string) => void
}) {
  const key = sel ? (sel.kind === 'unit' ? sel.unit.id : sel.segment.id) : 'none'
  const title = sel
    ? sel.kind === 'unit'
      ? (sel.unit.hasDetail ? MODULES[sel.unit.id].title.replace(/^\d+\/\d+\s*/, '') : sel.unit.name)
      : sel.segment.name
    : ''
  const eyebrow = sel
    ? sel.kind === 'unit'
      ? (sel.unit.ref ? `Unit ${sel.unit.ref}` : 'Module')
      : `${BUSES[sel.segment.bus].label} segment`
    : ''

  return (
    <AnimatePresence>
      {sel && (
        <motion.div
          key={key}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          role="region" aria-label={`${eyebrow}: ${title}`}
          className="absolute top-3 bottom-3 right-3 w-[480px] max-w-[calc(100vw-24px)] z-40 flex flex-col
                     border border-(--line) shadow-(--shadow) backdrop-blur-md"
          style={{ background: 'var(--glass)' }}
        >
          <div className="relative px-6 pt-5 pb-4 border-b border-(--line) shrink-0">
            <div className="absolute top-0 left-0 w-11 h-[3px] bg-(--accent)" />
            <div className="flex items-center gap-2 mb-1">
              {canBack && (
                <button onClick={onBack} aria-label="Back"
                  className="size-6 grid place-items-center border border-(--line) bg-(--surface-2)
                             hover:border-(--ink) transition-colors -ml-1">
                  <ArrowLeft size={12} />
                </button>
              )}
              <div className="micro">{eyebrow}</div>
            </div>
            <div className="text-lg font-semibold leading-snug pr-10 uppercase tracking-tight">{title}</div>
            {sel.kind === 'unit' && (
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => onTrace(sel.unit.id)}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]
                             px-3 py-1.5 border border-(--line) text-(--ink-2)
                             hover:border-(--accent) hover:text-(--accent) transition-colors"
                >
                  <Route size={11} /> Trace path
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-9 grid place-items-center border border-(--line)
                         bg-(--surface-2) hover:border-(--ink) transition-colors"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="overflow-y-auto px-6 pb-10 grow">
            {sel.kind === 'unit' ? (
              <UnitBody
                unit={sel.unit}
                pinFilterInit={pinFilterInit}
                pinFocus={pinFocus}
                onSelect={onSelect}
                onPinHighlight={onPinHighlight}
                onNetClick={onNetClick}
              />
            ) : (
              <SegmentBody segment={sel.segment} onSelect={onSelect} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
