import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { BUSES, type ModuleNodeData, type RailNodeData, type ZoneNodeData } from '../graph'

export const ModuleNode = memo(function ModuleNode({ data }: NodeProps<Node<ModuleNodeData, 'module'>>) {
  return (
    <div className={`module-node cat-${data.cat}`} style={{ width: data.w, height: data.h }}>
      {data.ref && !data.peripheral && <span className="nref">{data.ref}</span>}
      <span className="nname">{data.peripheral ? `${data.ref} ${data.name}` : data.name}</span>
      {data.hasDetail && <span className="dot" title="Pin-out documented" />}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  )
})

export const ZoneNode = memo(function ZoneNode({ data }: NodeProps<Node<ZoneNodeData, 'zone'>>) {
  return (
    <div
      className={`zone-node ${data.collapsed ? 'collapsed' : ''}`}
      style={{ width: data.w, height: data.collapsed ? 64 : data.h }}
    >
      <div className="ztitle" title={data.collapsed ? 'Expand cluster' : 'Collapse cluster'}>
        {data.collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
        <span>{data.label}</span>
      </div>
      {data.collapsed && (
        <div className="zsummary">
          {data.unitCount} units · {data.linkCount} links — click to expand
        </div>
      )}
    </div>
  )
})

export const RailNode = memo(function RailNode({ data }: NodeProps<Node<RailNodeData, 'rail'>>) {
  const color = BUSES[data.bus].color
  return (
    <div className="rail-node" style={{ width: data.w }}>
      <span className="rlabel" style={{ color }}>
        {data.label}
        <i className="rcount">{data.members.length} drops</i>
      </span>
      <div className="rbar" style={{ background: color }} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  )
})
