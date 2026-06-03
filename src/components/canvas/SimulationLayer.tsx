import { Zap } from 'lucide-react'
import type { WirePath } from '@/domain/types'
import type { CanvasTransform } from '@/hooks/useCanvasTransform'

interface SimulationLayerProps {
  path: WirePath
  progress: number
  transform: CanvasTransform
}

interface SegmentPoint {
  x: number
  y: number
  distFromStart: number
}

function buildSegmentPoints(path: WirePath): SegmentPoint[] {
  const pointMap = new Map(path.points.map(p => [p.id, p]))
  const pts: SegmentPoint[] = []
  let dist = 0

  if (path.points.length === 0) return pts

  const firstPoint = path.points[0]
  pts.push({ x: firstPoint.x, y: firstPoint.y, distFromStart: 0 })

  for (const seg of path.segments) {
    const from = pointMap.get(seg.fromPointId)
    const to = pointMap.get(seg.toPointId)
    if (!from || !to) continue
    dist += Math.hypot(to.x - from.x, to.y - from.y)
    pts.push({ x: to.x, y: to.y, distFromStart: dist })
  }

  return pts
}

function getPositionAtProgress(pts: SegmentPoint[], progress: number): { x: number; y: number } {
  if (pts.length === 0) return { x: 0, y: 0 }
  if (pts.length === 1) return { x: pts[0].x, y: pts[0].y }

  const total = pts[pts.length - 1].distFromStart
  if (total === 0) return { x: pts[0].x, y: pts[0].y }

  const targetDist = progress * total

  for (let i = 1; i < pts.length; i++) {
    if (pts[i].distFromStart >= targetDist) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const segLen = curr.distFromStart - prev.distFromStart
      const t = segLen === 0 ? 0 : (targetDist - prev.distFromStart) / segLen
      return {
        x: prev.x + (curr.x - prev.x) * t,
        y: prev.y + (curr.y - prev.y) * t,
      }
    }
  }

  return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y }
}

function worldToCanvas(wx: number, wy: number, t: CanvasTransform) {
  return { x: t.offsetX + wx * t.scale, y: t.offsetY - wy * t.scale }
}

export function SimulationLayer({ path, progress, transform }: SimulationLayerProps) {
  const pts = buildSegmentPoints(path)
  if (pts.length < 2) return null

  const pos = getPositionAtProgress(pts, progress)
  const { x: cx, y: cy } = worldToCanvas(pos.x, pos.y, transform)

  // Build trail path
  const total = pts[pts.length - 1].distFromStart
  const targetDist = progress * total
  const trailPts: { x: number; y: number }[] = []

  for (const p of pts) {
    if (p.distFromStart <= targetDist) {
      const { x, y } = worldToCanvas(p.x, p.y, transform)
      trailPts.push({ x, y })
    }
  }

  // Add interpolated end point
  trailPts.push(worldToCanvas(pos.x, pos.y, transform))

  const trailD = trailPts.length > 1
    ? trailPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
    : ''

  return (
    <g>
      {trailD && (
        <path
          d={trailD}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      )}
      <g transform={`translate(${cx - 10}, ${cy - 10})`}>
        <circle cx={10} cy={10} r={10} fill="var(--signal-wash)" stroke="var(--signal)" strokeWidth={1.5} />
        <g transform="translate(3, 3)">
          <Zap size={14} color="var(--signal-ink)" strokeWidth={2} />
        </g>
      </g>
    </g>
  )
}
