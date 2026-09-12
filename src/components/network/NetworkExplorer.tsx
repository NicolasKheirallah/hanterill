"use client";

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  Background, BackgroundVariant, Controls, MiniMap, Panel, ReactFlow, ReactFlowProvider,
  getNodesBounds, getViewportForBounds, useEdgesState, useNodesState, useReactFlow,
  type EdgeMouseHandler, type Node, type NodeMouseHandler,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import { Search, Cpu, Route, X, SlidersHorizontal, ImageDown, Link2, Check, Keyboard } from 'lucide-react'
import {
  BUSES, BUS_KEYS, DOMAINS, NODE_POS, RAW_EDGES, SEGMENT_BY_ID, STATS, UNIT_BY_ID,
  buildGraph, type AppEdge, type AppNode, type Bus, type Domain,
} from './graph'
import { ModuleNode, RailNode, ZoneNode } from './components/nodes'
import { FloatingEdge, TapEdge } from './components/edges'
import type { DrawerSel } from './components/DetailDrawer'
import '@xyflow/react/dist/style.css'
import './network.css'

const DetailDrawer = lazy(() => import('./components/DetailDrawer'))
const CommandK = lazy(() => import('./components/CommandK'))

const nodeTypes = { module: ModuleNode, zone: ZoneNode, rail: RailNode }
const edgeTypes = { floating: FloatingEdge, tap: TapEdge }
const { nodes: initialNodes, edges: initialEdges } = buildGraph()

/* Mid-tone values so nodes stay legible on the site's dark base and the
   light re-map alike; the drive hue follows the site's bronze accent. */
const MINIMAP_COLORS: Record<string, string> = {
  body: '#9b9b98', display: '#c9c9c5', drive: '#b0774f',
  compute: '#6a6a70', power: '#c8102e', peripheral: '#7a7a80',
}

/* static adjacency over canvas edges (modules + rails) for path tracing */
const ADJ = new Map<string, { edgeId: string; other: string; bus: Bus }[]>()
for (const e of initialEdges) {
  const d = e.data!
  for (const [a, b] of [[e.source, e.target], [e.target, e.source]] as const) {
    if (!ADJ.has(a)) ADJ.set(a, [])
    ADJ.get(a)!.push({ edgeId: e.id, other: b, bus: d.bus })
  }
}

interface TraceResult {
  from: string
  to: string
  edgeIds: string[]
  nodeIds: Set<string>
  hops: number
  buses: Bus[]
  cost: number
}

/* Dijkstra weighted by bus speed (faster buses preferred) */
function shortestPath(
  from: string, to: string,
  allowed: (bus: Bus, nodeId: string) => boolean,
  banned?: Set<string>,
): TraceResult | null {
  const dist = new Map<string, number>([[from, 0]])
  const prev = new Map<string, { node: string; edgeId: string; bus: Bus }>()
  const done = new Set<string>()
  for (;;) {
    let cur: string | null = null
    let best = Infinity
    for (const [n, d] of dist) if (!done.has(n) && d < best) { best = d; cur = n }
    if (cur === null) return null
    if (cur === to) break
    done.add(cur)
    for (const l of ADJ.get(cur) ?? []) {
      if (banned?.has(l.edgeId) || done.has(l.other) || !allowed(l.bus, l.other)) continue
      const nd = best + BUSES[l.bus].weight
      if (nd < (dist.get(l.other) ?? Infinity)) {
        dist.set(l.other, nd)
        prev.set(l.other, { node: cur, edgeId: l.edgeId, bus: l.bus })
      }
    }
  }
  const edgeIds: string[] = []
  const nodeIds = new Set<string>([to])
  const buses = new Set<Bus>()
  let cur = to
  while (cur !== from) {
    const p = prev.get(cur)!
    edgeIds.push(p.edgeId)
    buses.add(p.bus)
    nodeIds.add(p.node)
    cur = p.node
  }
  const hops = [...nodeIds].filter((id) => UNIT_BY_ID.has(id)).length - 1
  return { from, to, edgeIds, nodeIds, hops, buses: [...buses], cost: dist.get(to)! }
}

const subscribeNull = () => () => {}
const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function NetworkExplorerInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [hoverEdgeId, setHoverEdgeId] = useState<string | null>(null)
  const [busesOn, setBusesOn] = useState<Record<Bus, boolean>>(
    () => Object.fromEntries(BUS_KEYS.map((b) => [b, BUSES[b].defaultOn])) as Record<Bus, boolean>)
  const [showPeripherals, setShowPeripherals] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<Domain>>(new Set())
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [trace, setTrace] = useState<{ from: string; result?: TraceResult } | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [pinFilterInit, setPinFilterInit] = useState<string | undefined>(undefined)
  const [pinFocus, setPinFocus] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const rf = useReactFlow()
  const hoverTimer = useRef<number | null>(null)
  const helpCloseRef = useRef<HTMLButtonElement>(null)
  const mac = useSyncExternalStore(subscribeNull, isMac, () => false)
  const reduce = useReducedMotion()
  const motion = reduce ? 0 : 1

  useEffect(() => {
    if (helpOpen) helpCloseRef.current?.focus()
  }, [helpOpen])

  /* ---------------- visibility + highlight derivation ---------------- */
  const { visibleIds, neighborIds, hotEdgeIds, dimming } = useMemo(() => {
    const touched = new Set<string>()
    for (const e of RAW_EDGES) {
      if (!busesOn[e.bus]) continue
      touched.add(e.source); touched.add(e.target)
    }
    const visibleIds = new Set<string>()
    for (const u of UNIT_BY_ID.values()) {
      if (collapsed.has(u.domain)) continue
      if (u.peripheral && (!showPeripherals || !touched.has(u.id))) continue
      visibleIds.add(u.id)
    }
    /* rails visible if bus on and ≥1 member visible */
    for (const n of initialNodes) {
      if (n.type !== 'rail') continue
      const d = n.data
      if (busesOn[d.bus] && d.members.some((m: string) => visibleIds.has(m))) visibleIds.add(n.id)
    }
    const edgeVisible = (e: AppEdge) =>
      busesOn[e.data!.bus] && visibleIds.has(e.source) && visibleIds.has(e.target)

    const neighborIds = new Set<string>()
    const hotEdgeIds = new Set<string>()
    let dimming = false

    if (trace?.result) {
      dimming = true
      for (const id of trace.result.nodeIds) neighborIds.add(id)
      for (const id of trace.result.edgeIds) hotEdgeIds.add(id)
    } else {
      const focus = selectedId ?? hoverId
      if (focus) {
        dimming = selectedId !== null
        neighborIds.add(focus)
        for (const e of initialEdges) {
          if (!edgeVisible(e)) continue
          if (e.source === focus || e.target === focus) {
            hotEdgeIds.add(e.id)
            neighborIds.add(e.source)
            neighborIds.add(e.target)
          }
        }
      }
    }
    return { visibleIds, neighborIds, hotEdgeIds, dimming }
  }, [busesOn, showPeripherals, collapsed, selectedId, hoverId, trace])

  /* ---------------- apply to elements ---------------- */
  useEffect(() => {
    const fading = dimming || hoverId !== null || trace?.result != null
    setNodes((ns) => ns.map((n) => {
      if (n.type === 'zone') {
        const hidden = !!n.data.peripheral && !showPeripherals
        const isCollapsed = collapsed.has(n.data.domain)
        if (n.hidden === hidden && n.data.collapsed === isCollapsed) return n
        return { ...n, hidden, data: { ...n.data, collapsed: isCollapsed } }
      }
      const hidden = !visibleIds.has(n.id)
      const dim = dimming && !neighborIds.has(n.id)
      const cls = `${dim ? 'dim' : ''}${n.id === selectedId ? ' sel' : ''}`
      if (n.hidden === hidden && n.className === cls) return n
      return { ...n, hidden, className: cls }
    }))
    setEdges((es) => es.map((e) => {
      const hidden = !busesOn[e.data!.bus] || !visibleIds.has(e.source) || !visibleIds.has(e.target)
      const hot = hotEdgeIds.has(e.id)
      const hovered = e.id === hoverEdgeId
      const faded = fading && !hot && !hovered
      const d = e.data!
      if (e.hidden === hidden && d.hot === hot && d.faded === faded && d.hovered === hovered) return e
      return { ...e, hidden, data: { ...d, hot, faded, hovered } }
    }))
  }, [visibleIds, neighborIds, hotEdgeIds, dimming, busesOn, collapsed, showPeripherals,
      selectedId, hoverId, hoverEdgeId, trace, setNodes, setEdges])

  /* ---------------- selection / navigation ---------------- */
  /* History bookkeeping reads the current selection from a ref: pushing it
     inside a setSelectedId updater would double-fire under StrictMode. */
  const selectedRef = useRef<string | null>(null)
  useEffect(() => { selectedRef.current = selectedId }, [selectedId])

  const select = useCallback((id: string | null, center = false, fromBack = false) => {
    const prev = selectedRef.current
    if (!fromBack && prev && id && prev !== id) {
      setHistory((h) => [...h.slice(-19), prev])
    }
    setSelectedId(id)
    setPinFilterInit(undefined)
    setPinFocus(null)
    if (id) {
      const u = UNIT_BY_ID.get(id)
      if (u?.peripheral) setShowPeripherals(true)
      if (u) setCollapsed((c) => {
        if (!c.has(u.domain)) return c
        const next = new Set(c); next.delete(u.domain); return next
      })
      if (center) requestAnimationFrame(() =>
        rf.fitView({ nodes: [{ id }], duration: 600 * motion, maxZoom: 1.15, padding: 2.2 }))
    }
  }, [rf, motion])

  const back = useCallback(() => {
    if (!history.length) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    select(prev, true, true)
  }, [history, select])

  const onNetClick = useCallback((net: string) => {
    const seg = Array.from(SEGMENT_BY_ID.values()).find((s) => s.name.toLowerCase() === net.toLowerCase())
    if (seg) select(seg.id)
  }, [select])

  const completeTrace = useCallback((from: string, to: string) => {
    /* try with current bus filters, then fall back to all networks */
    let result = shortestPath(from, to, (bus, nodeId) => busesOn[bus] && visibleIds.has(nodeId))
    if (!result) {
      result = shortestPath(from, to, () => true)
      if (result) {
        setBusesOn((s) => {
          const next = { ...s }
          for (const b of result!.buses) next[b] = true
          return next
        })
        if ([...result.nodeIds].some((id) => UNIT_BY_ID.get(id)?.peripheral)) setShowPeripherals(true)
      }
    }
    setTrace(result ? { from, result } : null)
  }, [busesOn, visibleIds])

  const onNodeClick = useCallback<NodeMouseHandler<AppNode>>((_, node) => {
    if (node.type === 'zone') {
      const domain = node.data.domain as Domain
      setCollapsed((c) => {
        const next = new Set(c)
        if (next.has(domain)) next.delete(domain); else next.add(domain)
        return next
      })
      return
    }
    if (trace && !trace.result && node.id !== trace.from && node.type === 'module') {
      completeTrace(trace.from, node.id)
      return
    }
    select(node.id)
  }, [select, trace, completeTrace])

  const onNodeMouseEnter = useCallback<NodeMouseHandler<AppNode>>((_, node) => {
    if (node.type === 'module' || node.type === 'rail') setHoverId(node.id)
  }, [])

  const onEdgeEnter = useCallback<EdgeMouseHandler<AppEdge>>((_, edge) => setHoverEdgeId(edge.id), [])
  const onEdgeLeave = useCallback<EdgeMouseHandler<AppEdge>>(() => setHoverEdgeId(null), [])

  /* edge click → cross-reference into the open pin table */
  const onEdgeClick = useCallback<EdgeMouseHandler<AppEdge>>((_, edge) => {
    if (!selectedId || (edge.source !== selectedId && edge.target !== selectedId)) return
    const otherId = edge.source === selectedId ? edge.target : edge.source
    const seg = SEGMENT_BY_ID.get(otherId)
    const text = seg ? seg.name : (UNIT_BY_ID.get(otherId)?.ref || UNIT_BY_ID.get(otherId)?.name || '')
    if (!text) return
    setPinFocus(null)
    setTimeout(() => setPinFocus(text), 30)
  }, [selectedId])

  /* pin row click → flash the partner unit on the canvas */
  const onPinHighlight = useCallback((unitId: string | null) => {
    if (!unitId) return
    setHoverId(unitId)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => setHoverId(null), 2600)
  }, [])

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }, [])

  /* ---------------- export & share ---------------- */
  const exportPng = useCallback(async () => {
    const viewport = document.querySelector<HTMLElement>('.react-flow__viewport')
    if (!viewport || exporting) return
    setExporting(true)
    try {
      const bounds = getNodesBounds(rf.getNodes().filter((n) => !n.hidden))
      const pad = 60
      bounds.x -= pad * 2.2; bounds.width += pad * 3.2   // room for rail labels
      bounds.y -= pad; bounds.height += pad * 2
      const scale = Math.min(2, 4200 / bounds.width)
      const w = Math.round(bounds.width * scale)
      const h = Math.round(bounds.height * scale)
      const vp = getViewportForBounds(bounds, w, h, 0.1, 4, 0)
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
      const url = await toPng(viewport, {
        backgroundColor: bg || '#12151a',
        width: w,
        height: h,
        pixelRatio: 1,
        style: {
          width: `${w}px`,
          height: `${h}px`,
          transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
        },
        filter: (el) => !(el as HTMLElement).classList?.contains('edge-tip'),
      })
      const a = document.createElement('a')
      a.download = 'cma-network-explorer.png'
      a.href = url
      a.click()
    } finally {
      setExporting(false)
    }
  }, [rf, exporting])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }, [])

  /* ---------------- deep-linking + URL sync ---------------- */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    if (p.get('peripherals') === '1') setShowPeripherals(true)
    const nets = p.get('nets')
    if (nets !== null) {
      const on = new Set(nets.split(',').filter(Boolean))
      setBusesOn(Object.fromEntries(BUS_KEYS.map((b) => [b, on.has(b)])) as Record<Bus, boolean>)
    }
    const col = p.get('collapsed')
    if (col) setCollapsed(new Set(col.split(',').filter((d) => d in DOMAINS) as Domain[]))
    const sel = p.get('select')
    if (sel && (UNIT_BY_ID.has(sel) || SEGMENT_BY_ID.has(sel))) setTimeout(() => select(sel, true), 350)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* The first run is skipped so a deep link's params survive until the
     deferred select() applies them; otherwise the initial replaceState would
     strip ?select= in the window before the 350 ms center fires. */
  const urlSynced = useRef(false)
  useEffect(() => {
    if (!urlSynced.current) { urlSynced.current = true; return }
    const p = new URLSearchParams(location.search)
    if (selectedId) p.set('select', selectedId); else p.delete('select')
    if (showPeripherals) p.set('peripherals', '1'); else p.delete('peripherals')
    const defaults = BUS_KEYS.every((b) => busesOn[b] === BUSES[b].defaultOn)
    if (!defaults) p.set('nets', BUS_KEYS.filter((b) => busesOn[b]).join(',')); else p.delete('nets')
    if (collapsed.size) p.set('collapsed', [...collapsed].join(',')); else p.delete('collapsed')
    const q = p.toString()
    window.history.replaceState(null, '', q ? `?${q}` : location.pathname)
  }, [selectedId, busesOn, showPeripherals, collapsed])

  /* ---------------- keyboard ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        /* the site palette defers to prevented events: on this page ⌘K/Ctrl+K
           searches units and pins, not pages */
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (e.target instanceof HTMLInputElement) return
      /* single-key commands only: Ctrl+F / Cmd+arrow must keep working */
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') {
        if (helpOpen) setHelpOpen(false)
        else if (trace) setTrace(null)
        else setSelectedId(null)
      }
      if (e.key === 'f') rf.fitView({ duration: 500 * motion, padding: 0.06 })
      if (e.key === '?') setHelpOpen((o) => !o)
      if (e.key.startsWith('Arrow') && selectedId && NODE_POS.has(selectedId)) {
        e.preventDefault()
        const cur = NODE_POS.get(selectedId)!
        const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2
        const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]!
        let best: string | null = null, bestScore = Infinity
        for (const [id, p] of NODE_POS) {
          if (id === selectedId || !visibleIds.has(id)) continue
          const dx = p.x + p.w / 2 - cx, dy = p.y + p.h / 2 - cy
          const along = dx * dir[0] + dy * dir[1]
          if (along <= 0) continue
          const ortho = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0])
          const score = along + ortho * 2.5
          if (score < bestScore) { bestScore = score; best = id }
        }
        if (best) select(best, true)
      }
    }
    /* capture phase: this chunk mounts after the site CommandProvider, so a
       bubble listener would fire second and the site palette would win the
       defaultPrevented check */
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [rf, trace, selectedId, visibleIds, select, helpOpen, motion])

  /* ---------------- drawer selection ---------------- */
  const drawerSel: DrawerSel | null = useMemo(() => {
    if (!selectedId) return null
    const seg = SEGMENT_BY_ID.get(selectedId)
    if (seg) return { kind: 'segment', segment: seg }
    const unit = UNIT_BY_ID.get(selectedId)
    return unit ? { kind: 'unit', unit } : null
  }, [selectedId])

  const traceFromName = trace ? `${UNIT_BY_ID.get(trace.from)?.ref ?? ''} ${UNIT_BY_ID.get(trace.from)?.name ?? trace.from}` : ''
  const traceToName = trace?.result ? `${UNIT_BY_ID.get(trace.result.to)?.ref ?? ''} ${UNIT_BY_ID.get(trace.result.to)?.name ?? ''}` : ''

  return (
    <div className="h-full flex flex-col">
      {/* ————— top bar ————— */}
      <header className="relative z-30 flex items-center gap-3 sm:gap-5 h-16 px-3 sm:px-6 bg-(--surface) border-b border-(--line) shrink-0
                         before:absolute before:top-0 before:inset-x-0 before:h-[3px] before:bg-(--accent)">
        <div className="flex items-baseline gap-3.5 whitespace-nowrap">
          <span className="text-[15px] font-semibold uppercase tracking-[0.42em]">
            CMA<em className="not-italic text-(--accent)">.</em>
          </span>
          <span className="micro border-l border-(--line) pl-3.5 hidden md:block">Network explorer</span>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-[10px] tracking-[0.1em] uppercase text-(--ink-3) font-medium">
          <span><b className="text-(--ink-2)">{STATS.units + STATS.peripherals}</b> units</span>
          <span><b className="text-(--ink-2)">{STATS.edges}</b> links</span>
          <span><b className="text-(--ink-2)">{STATS.segments}</b> bus rails</span>
          <span><b className="text-(--ink-2)">{STATS.pins}</b> pins</span>
          <span><b className="text-(--ink-2)">{STATS.documented}</b> documented</span>
        </div>
        <div className="grow" />
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2.5 h-9 px-3.5 sm:min-w-56 border border-(--line) bg-(--surface-2)
                     text-(--ink-3) text-[13px] hover:border-(--ink) transition-colors"
        >
          <Search size={13} />
          <span className="grow text-left hidden sm:block">Search units & pins…</span>
          <kbd className="hidden sm:block text-[9px] font-semibold border border-(--line) px-1.5 py-0.5 tracking-wider">{mac ? "⌘K" : "Ctrl K"}</kbd>
        </button>
        <button
          onClick={copyLink}
          className="hidden sm:grid size-9 place-items-center border border-(--line) bg-(--surface-2) hover:border-(--ink) transition-colors shrink-0"
          aria-label="Copy share link"
          title="Copy a link to the current view"
        >
          {copied ? <Check size={15} className="text-(--accent)" /> : <Link2 size={15} />}
        </button>
        <button
          onClick={exportPng}
          disabled={exporting}
          className="hidden sm:grid size-9 place-items-center border border-(--line) bg-(--surface-2) hover:border-(--ink) transition-colors shrink-0 disabled:opacity-40"
          aria-label="Export diagram as PNG"
          title="Export diagram as PNG"
        >
          <ImageDown size={15} className={exporting ? 'animate-pulse' : ''} />
        </button>
        <button
          onClick={() => setHelpOpen(true)}
          className="hidden md:grid size-9 place-items-center border border-(--line) bg-(--surface-2) hover:border-(--ink) transition-colors shrink-0"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard size={15} />
        </button>
      </header>

      {/* ————— canvas ————— */}
      <div className="relative grow min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={() => setHoverId(null)}
          onEdgeClick={onEdgeClick}
          onEdgeMouseEnter={onEdgeEnter}
          onEdgeMouseLeave={onEdgeLeave}
          onPaneClick={() => { if (!trace?.result) setSelectedId(null) }}
          fitView
          fitViewOptions={{ padding: 0.06 }}
          minZoom={0.12}
          maxZoom={3}
          nodesConnectable={false}
          nodesDraggable={false}
          edgesFocusable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="var(--line)" />
          <Controls position="top-right" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            pannable zoomable
            className="app-minimap"
            style={{ background: 'var(--surface)' }}
            maskColor="color-mix(in srgb, var(--ink) 8%, transparent)"
            nodeColor={(n: Node) => {
              if (n.type === 'zone') return 'transparent'
              if (n.type === 'rail') return BUSES[(n.data as { bus: Bus }).bus].color
              return MINIMAP_COLORS[(n.data as { cat?: string }).cat ?? 'body'] ?? '#999'
            }}
          />

          {/* mobile filter toggle */}
          <Panel position="top-left" className="filters-toggle">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="size-9 grid place-items-center border border-(--line) backdrop-blur-md"
              style={{ background: 'var(--glass)' }}
              aria-label="Toggle filters"
              aria-expanded={filtersOpen}
              aria-controls="cma-filters"
            >
              <SlidersHorizontal size={14} />
            </button>
          </Panel>

          {/* filter chips */}
          <Panel position="top-left" id="cma-filters" className={`filters-panel ${filtersOpen ? 'open' : ''} flex flex-col gap-1.5 max-w-60`}>
            <div className="micro mb-1">Networks</div>
            {BUS_KEYS.map((b) => {
              const on = busesOn[b]
              const count = RAW_EDGES.filter((e) => e.bus === b).length
              return (
                <button
                  key={b}
                  onClick={() => setBusesOn((s) => ({ ...s, [b]: !s[b] }))}
                  aria-pressed={on}
                  className={`flex items-center gap-2.5 px-3 h-8 border text-[11px] font-medium tracking-wide
                              backdrop-blur-md transition-all text-left
                              ${on ? 'border-(--line) text-(--ink)' : 'border-transparent text-(--ink-3) opacity-60'}`}
                  style={{ background: 'var(--glass)' }}
                >
                  <i className="w-4 border-t-[3px] shrink-0"
                     style={{ borderColor: BUSES[b].color, opacity: on ? 1 : 0.3 }} />
                  <span className="grow">{BUSES[b].label}</span>
                  <span className="text-[9px] text-(--ink-3) tabular-nums">{count}</span>
                </button>
              )
            })}
            <button
              onClick={() => setShowPeripherals((v) => !v)}
              aria-pressed={showPeripherals}
              className={`mt-2 flex items-center gap-2.5 px-3 h-8 border text-[11px] font-medium tracking-wide
                          backdrop-blur-md transition-all text-left
                          ${showPeripherals ? 'border-(--accent) text-(--ink)' : 'border-(--line) text-(--ink-3)'}`}
              style={{ background: 'var(--glass)' }}
            >
              <Cpu size={12} className="shrink-0" />
              <span className="grow">Peripherals</span>
              <span className="text-[9px] text-(--ink-3) tabular-nums">{STATS.peripherals}</span>
            </button>
            <div className="text-[9px] leading-relaxed text-(--ink-3) px-1 pt-1">
              Solid = documented pin-out · dashed = inferred from block diagram.
              Click a cluster title to collapse it.
            </div>
          </Panel>

          {/* trace banner */}
          {trace && (
            <Panel position="top-center" role="status">
              <div className="trace-banner backdrop-blur-md" style={{ background: 'var(--glass)' }}>
                <Route size={13} className="shrink-0 text-(--accent)" />
                {!trace.result ? (
                  <span>
                    Tracing from <b>{traceFromName}</b> — click a destination unit
                    <span className="text-(--ink-3)"> · Esc to cancel</span>
                  </span>
                ) : (
                  <span>
                    <b>{traceFromName}</b> → <b>{traceToName}</b>
                    <span className="text-(--ink-3)"> · {trace.result.hops} hop{trace.result.hops === 1 ? '' : 's'} via </span>
                    {trace.result.buses.map((b) => (
                      <i key={b} role="img" aria-label={BUSES[b].label} title={BUSES[b].label}
                         className="inline-block size-2 ml-1 align-middle" style={{ background: BUSES[b].color }} />
                    ))}
                  </span>
                )}
                <button onClick={() => setTrace(null)} aria-label="Clear trace"
                  className="ml-2 size-6 grid place-items-center border border-(--line) hover:border-(--ink) transition-colors">
                  <X size={11} />
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>

        {helpOpen && (
          <div className="absolute inset-0 z-50 grid place-items-center" onClick={() => setHelpOpen(false)}>
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
            <div
              className="relative w-[420px] max-w-[calc(100vw-32px)] border border-(--line) bg-(--surface) shadow-(--shadow)
                         before:absolute before:top-0 before:left-0 before:w-11 before:h-[3px] before:bg-(--accent)"
              role="dialog" aria-label="Keyboard shortcuts"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-5 pb-3 border-b border-(--line) flex items-center justify-between">
                <span className="micro">Keyboard shortcuts</span>
                <button ref={helpCloseRef} onClick={() => setHelpOpen(false)} aria-label="Close"
                  className="size-7 grid place-items-center border border-(--line) hover:border-(--ink) transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="px-6 py-4 flex flex-col gap-2.5 text-[12.5px]">
                {([
                  [mac ? '⌘K' : 'Ctrl+K', 'Search units & all pin rows'],
                  ['↑ ↓ ← →', 'Hop to the nearest unit'],
                  ['F', 'Fit the whole diagram'],
                  ['Esc', 'Close drawer / cancel trace'],
                  ['?', 'This overlay'],
                ] as const).map(([k, d]) => (
                  <div key={k} className="flex items-center gap-4">
                    <kbd className="min-w-24 text-center text-[10px] font-semibold border border-(--line) bg-(--surface-2) px-2 py-1 tracking-wider">{k}</kbd>
                    <span className="text-(--ink-2)">{d}</span>
                  </div>
                ))}
                <div className="mt-2 pt-3 border-t border-(--line) text-[11px] text-(--ink-3) leading-relaxed">
                  Click a cluster title to collapse it · click a rail for its drops · click a pin row
                  to flash the connection · click a glowing edge to find its pins.
                </div>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <DetailDrawer
            sel={drawerSel}
            onClose={() => setSelectedId(null)}
            onSelect={(id) => select(id, true)}
            onBack={back}
            canBack={history.length > 0}
            onTrace={(fromId) => setTrace({ from: fromId })}
            pinFilterInit={pinFilterInit}
            pinFocus={pinFocus}
            onPinHighlight={onPinHighlight}
            onNetClick={onNetClick}
          />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        {paletteOpen && (
          <CommandK
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            onPick={(id) => select(id, true)}
            onPickPin={(moduleId, filter) => {
              select(moduleId, true)
              setTimeout(() => setPinFilterInit(filter), 50)
            }}
          />
        )}
      </Suspense>
    </div>
  )
}

export default function NetworkExplorerPage() {
  return (
    <ReactFlowProvider>
      <NetworkExplorerInner />
    </ReactFlowProvider>
  )
}
