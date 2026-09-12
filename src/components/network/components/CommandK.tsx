import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import { DOMAINS, UNITS, type Domain, type ModuleDetail } from '../graph'
import modulesJson from '../data/modules.json'

const MODULES = modulesJson as unknown as Record<string, ModuleDetail>
const ORDER: Domain[] = ['core', 'drive', 'driver', 'media', 'adas', 'chassis', 'connect', 'power', 'body', 'peripheral']

interface PinItem {
  moduleId: string
  moduleName: string
  pin: string
  net: string
  target: string
  value: string
}

export default function CommandK({
  open, onOpenChange, onPick, onPickPin,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onPick: (id: string) => void
  onPickPin: (moduleId: string, filter: string) => void
}) {
  const pinItems = useMemo<PinItem[]>(() => {
    const items: PinItem[] = []
    for (const [id, m] of Object.entries(MODULES)) {
      const short = m.title.replace(/^\d+\/\d+\s*/, '').split(' ').slice(-1)[0]
      for (const p of m.pins) {
        if (p.sep || p.section || (!p.net && !p.pin)) continue
        items.push({
          moduleId: id,
          moduleName: short,
          pin: p.pin ?? '',
          net: p.net ?? '',
          target: p.target ?? '',
          value: `pin ${m.title} ${p.net} ${p.pin} ${p.target} ${p.color} ${p.note}`,
        })
      }
    }
    return items
  }, [])

  /* focus discipline mirrors the site palette: trap Tab inside the dialog,
     return focus to whatever opened it when it unmounts. The opener is
     captured during first render — by the mount effect the input's autoFocus
     has already stolen document.activeElement. */
  const prevActiveRef = useRef<HTMLElement | null>(null)
  if (prevActiveRef.current === null) prevActiveRef.current = document.activeElement as HTMLElement | null
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const nodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'input, button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => n.offsetParent !== null)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prevActiveRef.current?.focus()
    }
  }, [])

  if (!open) return null

  return createPortal(
    <>
      <div cmdk-overlay="" className="cma-palette-overlay" onClick={() => onOpenChange(false)} />
      <div cmdk-dialog="" className="cma-palette" role="dialog" aria-modal="true" aria-label="Search units and pins" ref={dialogRef}>
        <Command
          label="Search units and pins"
          shouldFilter
          onKeyDown={(e) => { if (e.key === 'Escape') onOpenChange(false) }}
        >
          <Command.Input placeholder="Search units & pins — try “inverter”, “LIN_14”, “horn”…" autoFocus />
          <Command.List>
            <Command.Empty>No matching unit or pin.</Command.Empty>
            {ORDER.map((d) => {
              const items = UNITS.filter((u) => u.domain === d)
              if (!items.length) return null
              return (
                <Command.Group key={d} heading={DOMAINS[d]}>
                  {items.map((u) => (
                    <Command.Item
                      key={u.id}
                      value={`${u.ref} ${u.name}`}
                      onSelect={() => { onPick(u.id); onOpenChange(false) }}
                    >
                      <span className="ref">{u.ref || '—'}</span>
                      <span className="uppercase text-xs tracking-wide">{u.name}</span>
                      {u.hasDetail && <i className="ml-auto size-1.5 rounded-full bg-(--accent) shrink-0" />}
                    </Command.Item>
                  ))}
                </Command.Group>
              )
            })}
            <Command.Group heading={`Pin-outs · ${pinItems.length} rows`}>
              {pinItems.map((p, i) => (
                <Command.Item
                  key={i}
                  value={p.value}
                  onSelect={() => { onPickPin(p.moduleId, p.net || p.pin); onOpenChange(false) }}
                >
                  <span className="ref">{p.moduleName} {p.pin}</span>
                  <span className="text-xs truncate">
                    {p.net && <b className="font-medium">{p.net}</b>}
                    {p.net && p.target ? ' → ' : ''}
                    <span className="text-(--ink-2)">{p.target}</span>
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </>,
    document.body,
  )
}
