import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  Position,
  getSmoothStepPath,
  useInternalNode,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react'
import { BUSES, SEGMENT_BY_ID, type EdgeData } from '../graph'

/* ---------------- shared bits ---------------- */
function edgeStyle(data: EdgeData, selected?: boolean) {
  const color = BUSES[data.bus].color
  const hot = data.hot || selected
  return {
    stroke: color,
    strokeWidth: hot ? 2.4 : data.bus === 'hv' ? 2.2 : 1.4,
    opacity: data.faded ? 0.05 : hot ? 1 : data.hovered ? 0.95 : 0.6,
    strokeDasharray: hot ? '7 4' : data.inferred ? '4 3' : undefined,
    animation: hot ? 'dashdraw 0.6s linear infinite' : undefined,
    transition: 'opacity 0.25s',
  } as const
}

function EdgeTip({ x, y, data }: { x: number; y: number; data: EdgeData }) {
  const color = BUSES[data.bus].color
  const seg = data.segment ? SEGMENT_BY_ID.get(data.segment) : null
  return (
    <EdgeLabelRenderer>
      <div
        className="edge-tip nodrag nopan"
        style={{ transform: `translate(-50%,-115%) translate(${x}px,${y}px)` }}
      >
        <div className="row">
          <i style={{ background: color }} />
          <b>{BUSES[data.bus].label}</b>
          {seg && <span className="seg">{seg.name}</span>}
        </div>
        {data.label && !seg && <div className="lbl">{data.label}</div>}
        {data.nets.length > 0 && (
          <div className="nets">{data.nets.slice(0, 5).join(' · ')}{data.nets.length > 5 ? ' …' : ''}</div>
        )}
        {(data.pins?.length ?? 0) > 0 && (
          <div className="nets">Pins: {data.pins!.slice(0, 8).join(', ')}{data.pins!.length > 8 ? ' …' : ''}</div>
        )}
        {data.inferred && <div className="inf">Inferred from block diagram (dashed)</div>}
      </div>
    </EdgeLabelRenderer>
  )
}

function HotLabel({ x, y, data, selected }: { x: number; y: number; data: EdgeData; selected?: boolean }) {
  if (!(selected || data.hot) || !data.label || data.hovered) return null
  return (
    <EdgeLabelRenderer>
      <div
        className="edge-hotlabel nodrag nopan"
        style={{
          transform: `translate(-50%,-50%) translate(${x}px,${y}px)`,
          borderColor: BUSES[data.bus].color,
        }}
      >
        {data.label}
      </div>
    </EdgeLabelRenderer>
  )
}

/* ---------------- tap edge (precomputed path into a rail) ---------------- */
type Props = EdgeProps & { data?: EdgeData }

export const TapEdge = memo(function TapEdge({ id, selected, data }: Props) {
  if (!data?.path) return null
  const x = (data.tipX as number) ?? 0
  const y = (data.tipY as number) ?? 0
  return (
    <>
      <BaseEdge id={id} path={data.path} style={edgeStyle(data, selected)} />
      {data.hovered && <EdgeTip x={x} y={y} data={data} />}
      <HotLabel x={x} y={y} data={data} selected={selected} />
    </>
  )
})

/* ---------------- floating edge (point-to-point) ---------------- */
function center(node: InternalNode) {
  return {
    x: node.internals.positionAbsolute.x + (node.measured.width ?? 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured.height ?? 0) / 2,
  }
}

function sideAnchor(node: InternalNode, pos: Position): [number, number] {
  const { x, y } = node.internals.positionAbsolute
  const w = node.measured.width ?? 0
  const h = node.measured.height ?? 0
  switch (pos) {
    case Position.Left: return [x, y + h / 2]
    case Position.Right: return [x + w, y + h / 2]
    case Position.Top: return [x + w / 2, y]
    default: return [x + w / 2, y + h]
  }
}

function params(a: InternalNode, b: InternalNode): [number, number, Position] {
  const ca = center(a)
  const cb = center(b)
  const pos =
    Math.abs(ca.x - cb.x) > Math.abs(ca.y - cb.y)
      ? ca.x > cb.x ? Position.Left : Position.Right
      : ca.y > cb.y ? Position.Top : Position.Bottom
  const [x, y] = sideAnchor(a, pos)
  return [x, y, pos]
}

export const FloatingEdge = memo(function FloatingEdge({ id, source, target, selected, data }: Props) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode || !data) return null

  const [sx, sy, sourcePos] = params(sourceNode, targetNode)
  const [tx, ty, targetPos] = params(targetNode, sourceNode)
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: sx, sourceY: sy, sourcePosition: sourcePos,
    targetX: tx, targetY: ty, targetPosition: targetPos,
    borderRadius: 10,
  })

  return (
    <>
      <BaseEdge id={id} path={path} style={edgeStyle(data, selected)} />
      {data.hovered && <EdgeTip x={labelX} y={labelY} data={data} />}
      <HotLabel x={labelX} y={labelY} data={data} selected={selected} />
    </>
  )
})
