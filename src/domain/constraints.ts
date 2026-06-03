import type { WirePath, Axis } from './types'
import { getConstrainedPointIds, approxEqual } from './utils'

/**
 * Phase 2 edit (and drag): propagate constraint changes.
 *
 * Rules:
 * 1. Find all "constrained points" (endpoints of any constrained segment).
 * 2. Among those, find every point whose value on `axis` equals vOld.
 * 3. Set their `axis` value to vNew.
 * 4. If the target point is free-placed (not constrained), still update its
 *    own value (only its own — no propagation).
 */
export function applyConstraintPropagation(
  path: WirePath,
  targetPointId: string,
  axis: Axis,
  vNew: number
): WirePath {
  const target = path.points.find(p => p.id === targetPointId)
  if (!target) return path

  const vOld = target[axis]
  const constrainedIds = getConstrainedPointIds(path)

  const updatedPoints = path.points.map(p => {
    if (constrainedIds.has(p.id) && approxEqual(p[axis], vOld)) {
      return { ...p, [axis]: vNew }
    }
    return p
  })

  // If the target is free-placed (not constrained), still update its own value
  if (!constrainedIds.has(targetPointId)) {
    const idx = updatedPoints.findIndex(p => p.id === targetPointId)
    if (idx !== -1) {
      updatedPoints[idx] = { ...updatedPoints[idx], [axis]: vNew }
    }
  }

  return { ...path, points: updatedPoints }
}

/**
 * Apply constraint propagation for both axes simultaneously (used for drag).
 */
export function applyConstraintPropagationXY(
  path: WirePath,
  targetPointId: string,
  newX: number,
  newY: number
): WirePath {
  const afterX = applyConstraintPropagation(path, targetPointId, 'x', newX)
  const afterXY = applyConstraintPropagation(afterX, targetPointId, 'y', newY)
  return afterXY
}

/**
 * Release the constraint on a specific segment.
 * The segment becomes free (orientation='free', isConstrained=false).
 */
export function releaseSegmentConstraint(
  path: WirePath,
  segmentId: string
): WirePath {
  const updatedSegments = path.segments.map(seg =>
    seg.id === segmentId
      ? { ...seg, isConstrained: false, orientation: 'free' as const }
      : seg
  )
  return { ...path, segments: updatedSegments }
}
