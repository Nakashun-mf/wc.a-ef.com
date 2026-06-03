import type { WirePath, Point, Segment } from './types'

export function approxEqual(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps
}

export function euclideanDistance(x: number, y: number): number {
  return Math.hypot(x, y)
}

export function getConstrainedPointIds(path: WirePath): Set<string> {
  const ids = new Set<string>()
  for (const seg of path.segments) {
    if (seg.isConstrained) {
      ids.add(seg.fromPointId)
      ids.add(seg.toPointId)
    }
  }
  return ids
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getPointLabel(index: number): string {
  return `P${index + 1}`
}

export function roundToDisplay(value: number): number {
  return Math.round(value * 100) / 100
}

export function determineOrientation(
  from: Point,
  to: Point
): 'horizontal' | 'vertical' | 'free' {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  if (approxEqual(dx, 0) && approxEqual(dy, 0)) return 'free'
  if (dx >= dy) return 'horizontal'
  return 'vertical'
}

export function snapToOrtho(
  prevX: number,
  prevY: number,
  rawX: number,
  rawY: number
): { x: number; y: number } {
  const dx = Math.abs(rawX - prevX)
  const dy = Math.abs(rawY - prevY)
  if (dx >= dy) {
    return { x: rawX, y: prevY }
  }
  return { x: prevX, y: rawY }
}

export function snapToGrid(
  x: number,
  y: number,
  gridSizeMm: number
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSizeMm) * gridSizeMm,
    y: Math.round(y / gridSizeMm) * gridSizeMm,
  }
}

export function createEmptyPath(id: string, name: string, now: number): WirePath {
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    points: [],
    segments: [],
    hasBeenEdited: false,
  }
}

export function buildSegment(
  fromPoint: Point,
  toPoint: Point,
  orthoMode: boolean
): Segment {
  const orientation = orthoMode
    ? determineOrientation(fromPoint, toPoint)
    : 'free'
  return {
    id: generateId(),
    fromPointId: fromPoint.id,
    toPointId: toPoint.id,
    orientation,
    isConstrained: orthoMode && orientation !== 'free',
  }
}

export function getTotalPathLength(path: WirePath): number {
  let total = 0
  const pointMap = new Map(path.points.map(p => [p.id, p]))
  for (const seg of path.segments) {
    const from = pointMap.get(seg.fromPointId)
    const to = pointMap.get(seg.toPointId)
    if (from && to) {
      total += Math.hypot(to.x - from.x, to.y - from.y)
    }
  }
  return total
}
