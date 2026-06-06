import { Link, Unlink } from 'lucide-react'
import type { WirePath, Point, Segment } from '@/domain/types'
import type { CanvasTransform } from '@/hooks/useCanvasTransform'

const POINT_RADIUS = 5
const POINT_RADIUS_SELECTED = 7
const LABEL_OFFSET = 8

interface PathLayerProps {
  path: WirePath
  selectedPointId: string | null
  selectedSegmentId: string | null
  transform: CanvasTransform
  onPointClick: (id: string) => void
  onSegmentClick: (id: string) => void
  onPointDragStart: (id: string, e: React.PointerEvent) => void
  onSegmentDragStart: (segmentId: string, fromPointId: string, toPointId: string, e: React.PointerEvent) => void
}

function worldToCanvas(wx: number, wy: number, t: CanvasTransform) {
  return { x: t.offsetX + wx * t.scale, y: t.offsetY - wy * t.scale }
}

function getSegmentColor(seg: Segment): string {
  if (!seg.isConstrained) return 'var(--ink-3)'
  if (seg.orientation === 'horizontal') return 'var(--info)'
  if (seg.orientation === 'vertical') return 'var(--signal)'
  return 'var(--ink-3)'
}

interface PointMarkerProps {
  point: Point
  index: number
  selected: boolean
  constrained: boolean
  transform: CanvasTransform
  onPointerDown: (e: React.PointerEvent) => void
  onClick: () => void
}

function PointMarker({ point, index, selected, constrained, transform, onPointerDown, onClick }: PointMarkerProps) {
  const { x, y } = worldToCanvas(point.x, point.y, transform)
  const r = selected ? POINT_RADIUS_SELECTED : POINT_RADIUS
  const fillColor = selected ? 'var(--signal)' : 'var(--surface)'
  const strokeColor = selected ? 'var(--signal)' : 'var(--ink-2)'

  return (
    <g
      style={{ cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onClick={e => { e.stopPropagation(); onClick() }}
    >
      <circle cx={x} cy={y} r={r + 6} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={selected ? 2 : 1.5}
      />
      <text
        x={x - LABEL_OFFSET}
        y={y - LABEL_OFFSET}
        fontSize={10}
        fontFamily="var(--font-mono)"
        fill="var(--ink-2)"
        textAnchor="end"
        dominantBaseline="auto"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        P{index + 1}
      </text>
      {constrained && (
        <g
          transform={`translate(${x - LABEL_OFFSET - 14}, ${y - LABEL_OFFSET - 10})`}
          style={{ pointerEvents: 'none' }}
        >
          <Link size={9} color="var(--signal-ink)" strokeWidth={1.75} />
        </g>
      )}
    </g>
  )
}

interface SegmentLineProps {
  seg: Segment
  from: Point
  to: Point
  selected: boolean
  transform: CanvasTransform
  onClick: () => void
  onPointerDown: (e: React.PointerEvent) => void
}

function SegmentLine({ seg, from, to, selected, transform, onClick, onPointerDown }: SegmentLineProps) {
  const p1 = worldToCanvas(from.x, from.y, transform)
  const p2 = worldToCanvas(to.x, to.y, transform)
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const color = selected ? 'var(--warn)' : getSegmentColor(seg)

  return (
    <g
      style={{ cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onClick={e => { e.stopPropagation(); onClick() }}
    >
      {/* Hit area */}
      <line
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="transparent"
        strokeWidth={16}
      />
      <line
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke={color}
        strokeWidth={selected ? 2.5 : 1.75}
        strokeLinecap="round"
      />
      {seg.isConstrained && (
        <g transform={`translate(${mx - 5}, ${my - 5})`} style={{ pointerEvents: 'none' }}>
          <Link size={10} color={color} strokeWidth={1.75} />
        </g>
      )}
      {!seg.isConstrained && seg.orientation === 'free' && (
        <g transform={`translate(${mx - 5}, ${my - 5})`} style={{ pointerEvents: 'none' }}>
          <Unlink size={10} color={color} strokeWidth={1.75} />
        </g>
      )}
    </g>
  )
}

export function PathLayer({
  path,
  selectedPointId,
  selectedSegmentId,
  transform,
  onPointClick,
  onSegmentClick,
  onPointDragStart,
  onSegmentDragStart,
}: PathLayerProps) {
  const pointMap = new Map(path.points.map(p => [p.id, p]))
  const constrainedPointIds = new Set<string>()
  for (const seg of path.segments) {
    if (seg.isConstrained) {
      constrainedPointIds.add(seg.fromPointId)
      constrainedPointIds.add(seg.toPointId)
    }
  }

  return (
    <g>
      {path.segments.map(seg => {
        const from = pointMap.get(seg.fromPointId)
        const to = pointMap.get(seg.toPointId)
        if (!from || !to) return null
        return (
          <SegmentLine
            key={seg.id}
            seg={seg}
            from={from}
            to={to}
            selected={selectedSegmentId === seg.id}
            transform={transform}
            onClick={() => onSegmentClick(seg.id)}
            onPointerDown={e => onSegmentDragStart(seg.id, seg.fromPointId, seg.toPointId, e)}
          />
        )
      })}
      {path.points.map((point, idx) => (
        <PointMarker
          key={point.id}
          point={point}
          index={idx}
          selected={selectedPointId === point.id}
          constrained={constrainedPointIds.has(point.id)}
          transform={transform}
          onPointerDown={e => onPointDragStart(point.id, e)}
          onClick={() => onPointClick(point.id)}
        />
      ))}
    </g>
  )
}
