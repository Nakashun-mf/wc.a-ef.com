import { Link, Unlink } from 'lucide-react'
import type { WirePath, Point, Segment } from '@/domain/types'
import type { CanvasTransform } from '@/hooks/useCanvasTransform'
import { roundToDisplay } from '@/domain/utils'

const POINT_RADIUS = 5
const POINT_RADIUS_SELECTED = 7

interface PathLayerProps {
  path: WirePath
  selectedPointId: string | null
  selectedSegmentId: string | null
  transform: CanvasTransform
  showCoords?: boolean
  onPointClick: (id: string) => void
  onSegmentClick: (id: string) => void
  onPointDragStart: (id: string, e: React.PointerEvent) => void
  onSegmentPointerDown: (id: string, e: React.PointerEvent) => void
  onSegmentPointerUp: (e: React.PointerEvent) => void
  onSegmentContextMenu: (id: string, e: React.MouseEvent) => void
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

// Returns the angle (in canvas space, radians) that points away from all connected segments.
// Uses the largest angular gap between segment directions.
function getLabelAngle(point: Point, path: WirePath, pointMap: Map<string, Point>): number {
  const angles: number[] = []

  for (const seg of path.segments) {
    let other: Point | undefined
    if (seg.fromPointId === point.id) other = pointMap.get(seg.toPointId)
    else if (seg.toPointId === point.id) other = pointMap.get(seg.fromPointId)
    if (!other) continue
    // Y is flipped: positive world Y = negative canvas Y (up on screen)
    angles.push(Math.atan2(-(other.y - point.y), other.x - point.x))
  }

  if (angles.length === 0) return -Math.PI * 3 / 4  // upper-left default
  if (angles.length === 1) return angles[0] + Math.PI  // opposite to segment

  const TWO_PI = 2 * Math.PI
  const sorted = [...angles].sort((a, b) => a - b)
  let maxGap = -1
  let maxMid = -Math.PI * 3 / 4

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]
    const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + TWO_PI
    const gap = next - curr
    // >= so equal gaps prefer the last one (wrap-around gap tends to point upward)
    if (gap >= maxGap) {
      maxGap = gap
      maxMid = curr + gap / 2
    }
  }

  return maxMid
}

interface PointMarkerProps {
  point: Point
  index: number
  selected: boolean
  constrained: boolean
  labelAngle: number
  showCoords: boolean
  transform: CanvasTransform
  onPointerDown: (e: React.PointerEvent) => void
  onClick: () => void
}

function PointMarker({ point, index, selected, constrained, labelAngle, showCoords, transform, onPointerDown, onClick }: PointMarkerProps) {
  const { x, y } = worldToCanvas(point.x, point.y, transform)
  const r = selected ? POINT_RADIUS_SELECTED : POINT_RADIUS
  const fillColor = selected ? 'var(--signal)' : 'var(--surface)'
  const strokeColor = selected ? 'var(--signal)' : 'var(--ink-2)'

  const DIST = showCoords ? 22 : 14
  const cosA = Math.cos(labelAngle)
  const sinA = Math.sin(labelAngle)
  const lx = x + cosA * DIST
  const ly = y + sinA * DIST

  const anchor = cosA < -0.3 ? 'end' : cosA > 0.3 ? 'start' : 'middle'
  const baseline = sinA < -0.3 ? 'auto' : sinA > 0.3 ? 'hanging' : 'central'

  return (
    <g
      data-canvas-interactive="true"
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
        x={lx}
        y={ly}
        fontSize={10}
        fontFamily="var(--font-mono)"
        fill="var(--ink-2)"
        textAnchor={anchor}
        dominantBaseline={baseline}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        P{index + 1}
        {showCoords && (
          <tspan x={lx} dy="1.3em" fontSize={9} fill="var(--ink-3)">
            ({roundToDisplay(point.x).toFixed(2)}, {roundToDisplay(point.y).toFixed(2)})
          </tspan>
        )}
      </text>
      {constrained && (() => {
        // Place icon just to the right of the P-label text
        const approxTextW = `P${index + 1}`.length * 6  // monospace 10px ≈ 6px/char
        const textRightX = anchor === 'end' ? lx : anchor === 'start' ? lx + approxTextW : lx + approxTextW / 2
        const iconCenterY = baseline === 'auto' ? ly - 5 : baseline === 'hanging' ? ly + 5 : ly
        return (
          <g
            transform={`translate(${textRightX + 2}, ${iconCenterY - 4})`}
            style={{ pointerEvents: 'none' }}
          >
            <Link size={9} color="var(--signal-ink)" strokeWidth={1.75} />
          </g>
        )
      })()}
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
  onPointerUp: (e: React.PointerEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
}

function SegmentLine({ seg, from, to, selected, transform, onClick, onPointerDown, onPointerUp, onContextMenu }: SegmentLineProps) {
  const p1 = worldToCanvas(from.x, from.y, transform)
  const p2 = worldToCanvas(to.x, to.y, transform)
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const color = selected ? 'var(--warn)' : getSegmentColor(seg)

  return (
    <g
      data-canvas-interactive="true"
      style={{ cursor: 'grab' }}
      onClick={e => { e.stopPropagation(); onClick() }}
      onPointerDown={e => { e.stopPropagation(); onPointerDown(e) }}
      onPointerUp={e => { e.stopPropagation(); onPointerUp(e) }}
      onContextMenu={e => { e.stopPropagation(); onContextMenu(e) }}
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
  showCoords = false,
  onPointClick,
  onSegmentClick,
  onPointDragStart,
  onSegmentPointerDown,
  onSegmentPointerUp,
  onSegmentContextMenu,
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
            onPointerDown={e => onSegmentPointerDown(seg.id, e)}
            onPointerUp={e => onSegmentPointerUp(e)}
            onContextMenu={e => onSegmentContextMenu(seg.id, e)}
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
          labelAngle={getLabelAngle(point, path, pointMap)}
          showCoords={showCoords}
          transform={transform}
          onPointerDown={e => onPointDragStart(point.id, e)}
          onClick={() => onPointClick(point.id)}
        />
      ))}
    </g>
  )
}
