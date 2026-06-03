import type { WirePath, Axis } from './types'
import { euclideanDistance } from './utils'

/**
 * Phase 1 edit: scale the entire path uniformly based on the ratio of
 * the edited point's distance from origin (before vs after the edit).
 *
 * Edge case: if the point is at the origin (distance == 0), only the
 * edited point is updated and the rest of the path is unchanged.
 */
export function applyScale(
  path: WirePath,
  targetPointId: string,
  axis: Axis,
  vNew: number
): WirePath {
  const target = path.points.find(p => p.id === targetPointId)
  if (!target) return path

  const before = { x: target.x, y: target.y }
  const after = { ...before, [axis]: vNew }

  const distBefore = euclideanDistance(before.x, before.y)
  const distAfter = euclideanDistance(after.x, after.y)

  if (distBefore === 0) {
    // Cannot compute scale ratio — update only the edited point
    const updatedPoints = path.points.map(p =>
      p.id === targetPointId ? { ...p, [axis]: vNew } : p
    )
    return { ...path, points: updatedPoints }
  }

  const s = distAfter / distBefore
  const updatedPoints = path.points.map(p => ({
    ...p,
    x: p.x * s,
    y: p.y * s,
  }))

  return { ...path, points: updatedPoints }
}
