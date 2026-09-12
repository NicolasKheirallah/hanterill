import type { Edge, Node } from '@xyflow/react'
import unitsJson from './data/units.json'
import edgesJson from './data/edges.json'
import segmentsJson from './data/segments.json'
import metaJson from './data/meta.json'

/* ------------------------------ raw data types ------------------------------ */
export type Bus = 'can' | 'lin' | 'flexray' | 'most' | 'video' | 'ethernet' | 'hv' | 'power' | 'signal'
export type Domain = 'driver' | 'media' | 'connect' | 'core' | 'adas' | 'drive' | 'chassis' | 'power' | 'body' | 'peripheral'

export interface Unit {
  id: string
  ref: string
  name: string
  cat: 'body' | 'display' | 'drive' | 'compute' | 'power' | 'peripheral'
  domain: Domain
  hasDetail: boolean
  peripheral?: boolean
}

export interface RawEdge {
  id: string
  source: string
  target: string
  bus: Bus
  nets: string[]
  notes: string[]
  pins: string[]
  label: string
  segment: string | null
  inferred: boolean
}

export interface Segment {
  id: string
  name: string
  bus: Bus
  members: string[]
  speed?: string
  wireH?: string
  wireL?: string
  busModules?: string
  messageCount?: number
  sourceUrl?: string
}

export interface PinRow {
  sep?: boolean
  section?: string
  target?: string
  net?: string
  pin?: string
  note?: string
  color?: string
  bus?: string
}

export interface ModuleDetail {
  title: string
  partNumber: string
  location: string
  pins: PinRow[]
}

export interface BusMessage {
  id: string
  len: string
  hex: string
  desc: string
  extra: string
  detail: string
}

export const UNITS = unitsJson as unknown as Unit[]
export const RAW_EDGES = edgesJson as unknown as RawEdge[]
export const SEGMENTS = segmentsJson as unknown as Segment[]
export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]))
export const SEGMENT_BY_ID = new Map(SEGMENTS.map((s) => [s.id, s]))

/* ------------------------------ bus metadata ------------------------------ */
export const BUSES: Record<Bus, { label: string; color: string; defaultOn: boolean; weight: number }> = {
  can:      { label: 'CAN',          color: '#e0452e', defaultOn: true,  weight: 1.5 },
  lin:      { label: 'LIN',          color: '#55a345', defaultOn: true,  weight: 3 },
  flexray:  { label: 'FlexRay',      color: '#dea012', defaultOn: true,  weight: 1.2 },
  most:     { label: 'MOST',         color: '#9d6bf3', defaultOn: true,  weight: 1.6 },
  video:    { label: 'Video · LVDS', color: '#2da8e0', defaultOn: true,  weight: 1.3 },
  ethernet: { label: 'Ethernet',     color: '#1cb8a6', defaultOn: true,  weight: 1 },
  hv:       { label: '400 V HV',     color: '#ff7500', defaultOn: true,  weight: 4 },
  power:    { label: '12 V · GND',   color: '#8a8f96', defaultOn: false, weight: 5 },
  signal:   { label: 'Discrete I/O', color: '#b5a172', defaultOn: false, weight: 4 },
}
export const BUS_KEYS = Object.keys(BUSES) as Bus[]

/* ------------------------------ domain metadata ------------------------------ */
export const DOMAINS: Record<Domain, string> = {
  driver: 'Driver controls & steering',
  media: 'Displays & infotainment',
  connect: 'Connectivity & diagnostics',
  core: 'Core computers',
  adas: 'ADAS & safety',
  drive: 'Drivetrain & high voltage',
  chassis: 'Chassis & braking',
  power: 'Power distribution',
  body: 'Body & comfort',
  peripheral: 'Peripherals — sensors · switches · actuators',
}

/* ------------------------------ layout constants ------------------------------
 * Domain clusters on a fixed grid. Between cluster rows run corridors that
 * carry the bus rails and all wire runs; vertical bands (the gaps between
 * clusters in a row) carry cross-row transfers. Every edge path is precomputed
 * and collision-free against the cards: stubs leave a card sideways into its
 * cluster's empty gutter, run vertically to a corridor lane, and travel along
 * corridors/bands only.
 */
const CARD_W = 168
const CARD_H = 76
const PILL_H = 40
const GAP_X = 16
const GAP_Y = 14
const PAD = 16
const TITLE_H = 30
const RAIL_LANE_GAP = 17
const WIRE_LANE_GAP = 5
const CANVAS_W = 1500

interface Cluster { domain: Domain; cols: number; x: number; y: number; row: number }

const ROW_Y = [0, 630, 1350, 2250]
const CORRIDOR_Y = [438, 1158, 2058]       // first rail lane of each corridor

const CLUSTERS: Cluster[] = [
  { domain: 'driver',     cols: 2, x: 0,    y: ROW_Y[0], row: 0 },
  { domain: 'media',      cols: 2, x: 454,  y: ROW_Y[0], row: 0 },
  { domain: 'connect',    cols: 2, x: 908,  y: ROW_Y[0], row: 0 },
  { domain: 'adas',       cols: 2, x: 0,    y: ROW_Y[1], row: 1 },
  { domain: 'core',       cols: 1, x: 494,  y: ROW_Y[1], row: 1 },
  { domain: 'drive',      cols: 3, x: 794,  y: ROW_Y[1], row: 1 },
  { domain: 'body',       cols: 3, x: 0,    y: ROW_Y[2], row: 2 },
  { domain: 'chassis',    cols: 2, x: 648,  y: ROW_Y[2], row: 2 },
  { domain: 'power',      cols: 1, x: 1102, y: ROW_Y[2], row: 2 },
  { domain: 'peripheral', cols: 7, x: 0,    y: ROW_Y[3], row: 3 },
]

export const ROW_OF: Record<Domain, number> = {
  driver: 0, media: 0, connect: 0, adas: 1, core: 1, drive: 1,
  body: 2, chassis: 2, power: 2, peripheral: 3,
}

const degree = new Map<string, number>()
for (const e of RAW_EDGES) {
  degree.set(e.source, (degree.get(e.source) ?? 0) + 1)
  degree.set(e.target, (degree.get(e.target) ?? 0) + 1)
}

/* ------------------------------ flow element types ------------------------------ */
export type ModuleNodeData = {
  ref: string
  name: string
  cat: Unit['cat']
  domain: Domain
  hasDetail: boolean
  peripheral: boolean
  w: number
  h: number
  [key: string]: unknown
}
export type ZoneNodeData = {
  domain: Domain
  label: string
  w: number
  h: number
  peripheral?: boolean
  collapsed?: boolean
  unitCount: number
  linkCount: number
  [key: string]: unknown
}
export type RailNodeData = {
  segment: string
  label: string
  bus: Bus
  w: number
  members: string[]
  [key: string]: unknown
}
export type EdgeData = {
  bus: Bus
  nets: string[]
  pins?: string[]
  label: string
  segment?: string | null
  inferred?: boolean
  path?: string
  tipX?: number
  tipY?: number
  hot?: boolean
  faded?: boolean
  hovered?: boolean
  [key: string]: unknown
}
export type AppNode =
  | Node<ModuleNodeData, 'module'>
  | Node<ZoneNodeData, 'zone'>
  | Node<RailNodeData, 'rail'>
export type AppEdge = Edge<EdgeData>

/* ------------------------------ placement ------------------------------ */
interface Placed { x: number; y: number; w: number; h: number; cluster: Cluster; col: number }
export const NODE_POS = new Map<string, { x: number; y: number; w: number; h: number }>()

const placed = new Map<string, Placed>()
const clusterRect = new Map<Domain, { x: number; y: number; w: number; h: number }>()
const clusterMembers = new Map<Domain, Unit[]>()

for (const c of CLUSTERS) {
  const members = UNITS
    .filter((u) => u.domain === c.domain)
    .sort((a, b) =>
      (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) ||
      a.ref.localeCompare(b.ref, undefined, { numeric: true }) ||
      a.name.localeCompare(b.name))
  clusterMembers.set(c.domain, members)
  const cardH = c.domain === 'peripheral' ? PILL_H : CARD_H
  const rows = Math.max(1, Math.ceil(members.length / c.cols))
  const w = PAD * 2 + c.cols * (CARD_W + GAP_X) - GAP_X
  const h = TITLE_H + PAD * 2 + rows * (cardH + GAP_Y) - GAP_Y
  clusterRect.set(c.domain, { x: c.x, y: c.y, w, h })
  members.forEach((u, i) => {
    const col = i % c.cols
    const row = Math.floor(i / c.cols)
    const x = c.x + PAD + col * (CARD_W + GAP_X)
    const y = c.y + TITLE_H + PAD + row * (cardH + GAP_Y)
    placed.set(u.id, { x, y, w: CARD_W, h: cardH, cluster: c, col })
    NODE_POS.set(u.id, { x, y, w: CARD_W, h: cardH })
  })
}

/* vertical bands per row: gaps between clusters + outer margins */
const VBANDS: { lo: number; hi: number }[][] = [0, 1, 2, 3].map((row) => {
  const rects = CLUSTERS.filter((c) => c.row === row)
    .map((c) => clusterRect.get(c.domain)!)
    .sort((a, b) => a.x - b.x)
  const bands: { lo: number; hi: number }[] = [{ lo: -110, hi: -16 }]
  for (let i = 0; i < rects.length - 1; i++) {
    const lo = rects[i].x + rects[i].w + 8
    const hi = rects[i + 1].x - 8
    if (hi - lo > 24) bands.push({ lo, hi })
  }
  bands.push({ lo: Math.max(...rects.map((r) => r.x + r.w)) + 16, hi: CANVAS_W + 110 })
  return bands
})

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickBand(row: number, prefX: number, key: string): number {
  const bands = VBANDS[row]
  let best = bands[0]
  for (const b of bands) {
    const c = (b.lo + b.hi) / 2
    if (Math.abs(c - prefX) < Math.abs((best.lo + best.hi) / 2 - prefX)) best = b
  }
  const c = (best.lo + best.hi) / 2
  const jitter = ((hash(key) % 7) - 3) * 6
  return Math.max(best.lo + 4, Math.min(best.hi - 4, c + jitter))
}

/* gutter x a unit taps through */
function gutterX(p: Placed, jitter: number): number {
  const rect = clusterRect.get(p.cluster.domain)!
  let gx: number
  if (p.col === 0) gx = rect.x + 8
  else if (p.col === p.cluster.cols - 1) gx = rect.x + rect.w - 8
  else gx = p.x - GAP_X / 2
  return gx + jitter
}

/* ------------------------------ stub slots (pin-ordered) ------------------------------ */
/* every connection of a unit gets a vertical slot on the card edge, ordered by
   its lowest connector pin so wires leave the card in pin order */
const RAIL_SEGMENTS = SEGMENTS.filter((s) => s.members.length >= 3)
export const RAILED_SEGMENT_IDS = new Set(RAIL_SEGMENTS.map((s) => s.id))

type Conn = { key: string; pinKey: string }
const unitConns = new Map<string, Conn[]>()
function pushConn(unitId: string, key: string, pinKey: string) {
  if (!unitConns.has(unitId)) unitConns.set(unitId, [])
  unitConns.get(unitId)!.push({ key, pinKey })
}
{
  const segPin = new Map<string, string>() // `${unit}::${seg}` -> min pin
  for (const e of RAW_EDGES) {
    const railed = e.segment && RAILED_SEGMENT_IDS.has(e.segment)
    const pin = [...e.pins].sort()[0] ?? '~'
    if (railed) {
      for (const id of [e.source, e.target]) {
        const k = `${id}::${e.segment}`
        if (!segPin.has(k) || pin < segPin.get(k)!) segPin.set(k, pin)
      }
    } else {
      pushConn(e.source, e.id, pin)
      pushConn(e.target, e.id, pin)
    }
  }
  for (const s of RAIL_SEGMENTS) {
    for (const id of s.members) pushConn(id, `tap_${s.id}_${id}`, segPin.get(`${id}::${s.id}`) ?? '~')
  }
}
const stubSlot = new Map<string, { sy: number }>() // `${edgeKey}@${unitId}`
for (const [unitId, conns] of unitConns) {
  const p = placed.get(unitId)
  if (!p) continue
  conns.sort((a, b) => a.pinKey.localeCompare(b.pinKey, undefined, { numeric: true }) || a.key.localeCompare(b.key))
  const n = conns.length
  const usable = p.h - 18
  conns.forEach((c, i) => {
    const sy = p.y + 9 + (n === 1 ? usable / 2 : (usable * i) / (n - 1))
    stubSlot.set(`${c.key}@${unitId}`, { sy })
  })
}

/* ------------------------------ rails ------------------------------ */
function corridorFor(rows: number[]): number {
  let best = 0, bestCost = Infinity
  for (let k = 0; k < 3; k++) {
    const cost = rows.reduce((sum, r) => sum + (r <= k ? k - r : r - 1 - k), 0)
    if (cost < bestCost) { bestCost = cost; best = k }
  }
  return best
}

interface Rail {
  seg: Segment
  corridor: number
  y: number
  x: number
  w: number
  taps: { unitId: string; laneX: number; blocked: boolean }[]
}

const lanesUsed = [0, 0, 0]
const rails: Rail[] = RAIL_SEGMENTS.map((seg, segIdx) => {
  const members = seg.members.filter((id) => placed.has(id))
  const corridor = corridorFor(members.map((id) => ROW_OF[UNIT_BY_ID.get(id)!.domain]))
  const y = CORRIDOR_Y[corridor] + lanesUsed[corridor] * RAIL_LANE_GAP
  lanesUsed[corridor]++
  const jitter = ((segIdx % 3) - 1) * 4
  const taps = members.map((id) => {
    const p = placed.get(id)!
    const laneX = gutterX(p, jitter)
    const rect = clusterRect.get(p.cluster.domain)!
    const exitY = y < rect.y ? rect.y : rect.y + rect.h
    const blocked = verticalBlocked(laneX, exitY, y, p.cluster.domain)
    return { unitId: id, laneX, blocked }
  })
  const xs = taps.filter((t) => !t.blocked).map((t) => t.laneX)
  const x = (xs.length ? Math.min(...xs) : 100) - 30
  const w = Math.max((xs.length ? Math.max(...xs) : 300) - x + 30, 170)
  return { seg, corridor, y, x, w, taps }
})
const railById = new Map(rails.map((r) => [r.seg.id, r]))

function verticalBlocked(x: number, y1: number, y2: number, ownDomain: Domain): boolean {
  const lo = Math.min(y1, y2), hi = Math.max(y1, y2)
  for (const [domain, r] of clusterRect) {
    if (domain === ownDomain) continue
    if (x >= r.x - 2 && x <= r.x + r.w + 2 && hi > r.y && lo < r.y + r.h) return true
  }
  return false
}

/* ------------------------------ path helpers ------------------------------ */
function roundedPath(pts: [number, number][]): string {
  // drop collinear / duplicate points
  const p: [number, number][] = []
  for (const pt of pts) {
    const last = p[p.length - 1]
    if (last && Math.abs(last[0] - pt[0]) < 0.5 && Math.abs(last[1] - pt[1]) < 0.5) continue
    p.push(pt)
  }
  for (let i = p.length - 2; i > 0; i--) {
    const [a, b, c] = [p[i - 1], p[i], p[i + 1]]
    if ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])) p.splice(i, 1)
  }
  if (p.length < 2) return ''
  let d = `M ${p[0][0]} ${p[0][1]}`
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1], p[i], p[i + 1]]
    const r = Math.min(7,
      Math.hypot(b[0] - a[0], b[1] - a[1]) / 2,
      Math.hypot(c[0] - b[0], c[1] - b[1]) / 2)
    const inX = b[0] - Math.sign(b[0] - a[0]) * r
    const inY = b[1] - Math.sign(b[1] - a[1]) * r
    const outX = b[0] + Math.sign(c[0] - b[0]) * r
    const outY = b[1] + Math.sign(c[1] - b[1]) * r
    d += ` L ${inX} ${inY} Q ${b[0]} ${b[1]} ${outX} ${outY}`
  }
  const last = p[p.length - 1]
  d += ` L ${last[0]} ${last[1]}`
  return d
}

function tipOf(pts: [number, number][]): { tipX: number; tipY: number } {
  let best: [number, number][] = [pts[0], pts[1] ?? pts[0]]
  let bestLen = -1
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
    if (len > bestLen) { bestLen = len; best = [pts[i], pts[i + 1]] }
  }
  return { tipX: (best[0][0] + best[1][0]) / 2, tipY: (best[0][1] + best[1][1]) / 2 }
}

/* corridor wire lanes (below the rails of each corridor) */
const wireLaneCount = [0, 0, 0]
function wireLaneY(corridor: number): number {
  const base = CORRIDOR_Y[corridor] + lanesUsed[corridor] * RAIL_LANE_GAP + 12
  const y = base + (wireLaneCount[corridor] % 14) * WIRE_LANE_GAP
  wireLaneCount[corridor]++
  return y
}

/* stub exit from a module toward its gutter */
function stubExit(unitId: string, edgeKey: string, jitter: number): { sx: number; sy: number; gx: number } {
  const p = placed.get(unitId)!
  const gx = gutterX(p, jitter)
  const slot = stubSlot.get(`${edgeKey}@${unitId}`)
  const sy = Math.max(p.y + 7, Math.min(p.y + p.h - 7, slot ? slot.sy : p.y + p.h / 2))
  const sx = gx < p.x ? p.x : p.x + p.w
  return { sx, sy, gx }
}

/* full orthogonal route between two modules (or module → rail) */
function routeWire(e: { id: string; source: string; target: string }): { path: string; tipX: number; tipY: number } {
  const jitter = ((hash(e.id) % 4) - 1.5) * 4
  const targetRail = railById.get(e.target)
  const pts: [number, number][] = []

  const a = stubExit(e.source, e.id, jitter)
  const rowA = placed.get(e.source)!.cluster.row
  pts.push([a.sx, a.sy], [a.gx, a.sy])

  let cB: number
  let endFn: (curX: number, yLast: number) => void

  if (targetRail) {
    cB = targetRail.corridor
    endFn = (curX, yLast) => {
      const ax = Math.max(targetRail.x + 6, Math.min(targetRail.x + targetRail.w - 6, curX))
      pts.push([ax, yLast], [ax, targetRail.y])
    }
  } else {
    const b = stubExit(e.target, e.id, -jitter)
    const rowB = placed.get(e.target)!.cluster.row
    cB = rowB > rowA ? Math.min(rowB - 1, 2) : Math.min(rowB, 2)
    if (rowB === 3) cB = 2
    endFn = (_curX, yLast) => {
      pts.push([b.gx, yLast], [b.gx, b.sy], [b.sx, b.sy])
    }
  }

  let cA = cB > (rowA === 3 ? 2 : rowA) ? rowA : rowA - 1
  if (rowA === 0) cA = 0
  if (rowA === 3) cA = 2
  cA = Math.max(0, Math.min(2, cA))

  let cur = cA
  let curX = a.gx
  let y = wireLaneY(cur)
  pts.push([a.gx, y])
  while (cur !== cB) {
    const next = cur + (cB > cur ? 1 : -1)
    const crossRow = cB > cur ? cur + 1 : cur
    const bandX = pickBand(crossRow, curX, e.id + cur)
    const yNext = wireLaneY(next)
    pts.push([bandX, y], [bandX, yNext])
    cur = next
    curX = bandX
    y = yNext
  }
  endFn(curX, y)

  return { path: roundedPath(pts), ...tipOf(pts) }
}

/* straight tap into a rail through the cluster gutter */
function tapPath(unitId: string, laneX: number, railY: number, edgeKey: string): { path: string; tipX: number; tipY: number } {
  const p = placed.get(unitId)!
  const slot = stubSlot.get(`${edgeKey}@${unitId}`)
  const sy = Math.max(p.y + 7, Math.min(p.y + p.h - 7, slot ? slot.sy : p.y + p.h / 2))
  const sx = laneX < p.x ? p.x : p.x + p.w
  const pts: [number, number][] = [[sx, sy], [laneX, sy], [laneX, railY]]
  return { path: roundedPath(pts), tipX: laneX, tipY: (sy + railY) / 2 }
}

/* ------------------------------ public build ------------------------------ */
export const DOMAIN_STATS = new Map<Domain, { units: number; links: number }>()
for (const c of CLUSTERS) {
  const ids = new Set((clusterMembers.get(c.domain) ?? []).map((u) => u.id))
  DOMAIN_STATS.set(c.domain, {
    units: ids.size,
    links: RAW_EDGES.filter((e) => ids.has(e.source) || ids.has(e.target)).length,
  })
}

export function buildGraph(): { nodes: AppNode[]; edges: AppEdge[] } {
  const nodes: AppNode[] = []
  const edges: AppEdge[] = []

  for (const c of CLUSTERS) {
    const members = clusterMembers.get(c.domain) ?? []
    if (!members.length) continue
    const rect = clusterRect.get(c.domain)!
    const stats = DOMAIN_STATS.get(c.domain)!
    nodes.push({
      id: 'zone-' + c.domain,
      type: 'zone',
      position: { x: c.x, y: c.y },
      data: {
        domain: c.domain,
        label: DOMAINS[c.domain].toUpperCase(),
        w: rect.w, h: rect.h,
        peripheral: c.domain === 'peripheral',
        collapsed: false,
        unitCount: stats.units,
        linkCount: stats.links,
      },
      ariaLabel: `${DOMAINS[c.domain]}, cluster of ${stats.units} units, ${stats.links} links. Press Enter to collapse or expand.`,
      selectable: false,
      draggable: false,
      zIndex: -10,
    })
    for (const u of members) {
      const p = placed.get(u.id)!
      nodes.push({
        id: u.id,
        type: 'module',
        position: { x: p.x, y: p.y },
        draggable: false,
        data: {
          ref: u.ref, name: u.name, cat: u.cat, domain: u.domain,
          hasDetail: u.hasDetail, peripheral: !!u.peripheral, w: p.w, h: p.h,
        },
        ariaLabel: `${u.ref ? `${u.ref} ` : ''}${u.name}${u.hasDetail ? ', pin-out documented' : ''}. Press Enter to open details.`,
      })
    }
  }

  for (const rail of rails) {
    nodes.push({
      id: rail.seg.id,
      type: 'rail',
      position: { x: rail.x, y: rail.y - 10 },
      draggable: false,
      zIndex: -5,
      data: {
        segment: rail.seg.id,
        label: rail.seg.name,
        bus: rail.seg.bus,
        w: rail.w,
        members: rail.seg.members,
      },
      ariaLabel: `${BUSES[rail.seg.bus].label} rail ${rail.seg.name}, ${rail.seg.members.length} drops. Press Enter to list members.`,
    })
    const inferredByUnit = new Map<string, boolean>()
    const netsByUnit = new Map<string, string[]>()
    const pinsByUnit = new Map<string, string[]>()
    for (const e of RAW_EDGES) {
      if (e.segment !== rail.seg.id) continue
      for (const id of [e.source, e.target]) {
        inferredByUnit.set(id, (inferredByUnit.get(id) ?? true) && e.inferred)
        netsByUnit.set(id, [...new Set([...(netsByUnit.get(id) ?? []), ...e.nets])])
        pinsByUnit.set(id, [...new Set([...(pinsByUnit.get(id) ?? []), ...e.pins])])
      }
    }
    for (const t of rail.taps) {
      const key = `tap_${rail.seg.id}_${t.unitId}`
      const geo = t.blocked
        ? routeWire({ id: key, source: t.unitId, target: rail.seg.id })
        : tapPath(t.unitId, t.laneX, rail.y, key)
      edges.push({
        id: key,
        source: t.unitId,
        target: rail.seg.id,
        type: 'tap',
        data: {
          bus: rail.seg.bus,
          nets: netsByUnit.get(t.unitId) ?? [],
          pins: pinsByUnit.get(t.unitId) ?? [],
          label: rail.seg.name,
          segment: rail.seg.id,
          inferred: inferredByUnit.get(t.unitId) ?? false,
          ...geo,
        },
      })
    }
  }

  for (const e of RAW_EDGES) {
    if (e.segment && RAILED_SEGMENT_IDS.has(e.segment)) continue
    const geo = routeWire(e)
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'tap',
      data: {
        bus: e.bus, nets: e.nets, pins: e.pins, label: e.label,
        segment: e.segment, inferred: e.inferred, ...geo,
      },
    })
  }

  return { nodes, edges }
}

/* ------------------------------ stats ------------------------------ */
export const STATS = {
  units: UNITS.filter((u) => !u.peripheral).length,
  peripherals: UNITS.filter((u) => u.peripheral).length,
  documented: UNITS.filter((u) => u.hasDetail).length,
  edges: RAW_EDGES.length,
  segments: RAIL_SEGMENTS.length,
  pins: (metaJson as { pins: number }).pins,
  messages: (metaJson as { pins: number; messages: number }).messages,
}

/* ------------------------------ wire colours ------------------------------ */
export const WIRE_COLORS: Record<string, string> = {
  BK: '#1a1a1a', WH: '#f5f5f5', RD: '#d22d2d', GN: '#2e8b3a', BU: '#2b62c4', YE: '#e8c61b',
  OG: '#f07818', BN: '#7a4a21', GY: '#9b9b9b', VT: '#7d3fa8', PK: '#e87bb1', LI: '#b58ae0', SB: '#9cc3e8',
}
