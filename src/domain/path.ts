import type { WirePath, Point, Axis } from './types'
import { generateId, buildSegment, snapToOrtho, snapToGrid } from './utils'
import { applyScale } from './scale'
import { applyConstraintPropagation, applyConstraintPropagationXY } from './constraints'

export interface AddPointOptions {
  orthoMode: boolean
  snapEnabled: boolean
  gridSizeMm: number
  canvasX: number
  canvasY: number
  mmPerPx: number
  originPx: { x: number; y: number }
}

/**
 * Convert a canvas pixel coordinate to mm world coordinate
 * (relative to the path's P1 origin).
 */
export function canvasToWorld(
  px: number,
  py: number,
  originPx: { x: number; y: number },
  mmPerPx: number
): { x: number; y: number } {
  return {
    x: (px - originPx.x) * mmPerPx,
    y: -((py - originPx.y) * mmPerPx), // Y axis flipped (up is positive)
  }
}

/**
 * Convert a mm world coordinate to canvas pixel coordinate.
 */
export function worldToCanvas(
  wx: number,
  wy: number,
  originPx: { x: number; y: number },
  mmPerPx: number
): { x: number; y: number } {
  return {
    x: originPx.x + wx / mmPerPx,
    y: originPx.y - wy / mmPerPx, // Y axis flipped
  }
}

/**
 * Add a new point to the path and return the updated path.
 * Handles ortho mode and snap logic.
 */
export function addPoint(
  path: WirePath,
  rawMmX: number,
  rawMmY: number,
  options: { orthoMode: boolean; snapEnabled: boolean; gridSizeMm: number }
): WirePath {
  const { orthoMode, snapEnabled, gridSizeMm } = options
  const prevPoint = path.points[path.points.length - 1]

  let finalX = rawMmX
  let finalY = rawMmY

  // Apply ortho constraint first
  if (orthoMode && prevPoint) {
    const snapped = snapToOrtho(prevPoint.x, prevPoint.y, rawMmX, rawMmY)
    finalX = snapped.x
    finalY = snapped.y
  }

  // Apply grid snap (PC only)
  if (snapEnabled) {
    const snapped = snapToGrid(finalX, finalY, gridSizeMm)
    finalX = snapped.x
    finalY = snapped.y
    // Re-apply ortho after snap to keep alignment
    if (orthoMode && prevPoint) {
      const reSnapped = snapToOrtho(prevPoint.x, prevPoint.y, finalX, finalY)
      finalX = reSnapped.x
      finalY = reSnapped.y
    }
  }

  const newPoint: Point = {
    id: generateId(),
    x: finalX,
    y: finalY,
    freePlaced: !orthoMode,
  }

  const updatedPoints = [...path.points, newPoint]
  const updatedSegments = [...path.segments]

  if (prevPoint) {
    updatedSegments.push(buildSegment(prevPoint, newPoint, orthoMode))
  }

  return { ...path, points: updatedPoints, segments: updatedSegments }
}

/**
 * Delete a point and reconnect the path (new segment is free/unconstrained).
 */
export function deletePoint(path: WirePath, pointId: string): WirePath {
  const idx = path.points.findIndex(p => p.id === pointId)
  if (idx === -1) return path

  const updatedPoints = path.points.filter(p => p.id !== pointId)

  // Remove segments connected to this point
  const updatedSegments = path.segments.filter(
    s => s.fromPointId !== pointId && s.toPointId !== pointId
  )

  // Reconnect previous and next points with a free segment
  const prevPoint = path.points[idx - 1]
  const nextPoint = path.points[idx + 1]
  if (prevPoint && nextPoint) {
    updatedSegments.splice(idx - 1, 0, buildSegment(prevPoint, nextPoint, false))
  }

  return { ...path, points: updatedPoints, segments: updatedSegments }
}

/**
 * Numerically edit a coordinate. Applies scale (1st edit) or
 * constraint propagation (2nd+ edit).
 */
export function editCoordinate(
  path: WirePath,
  targetPointId: string,
  axis: Axis,
  vNew: number
): WirePath {
  if (!path.hasBeenEdited) {
    const newPath = applyScale(path, targetPointId, axis, vNew)
    return { ...newPath, hasBeenEdited: true }
  }
  return applyConstraintPropagation(path, targetPointId, axis, vNew)
}

/**
 * Drag a point (constraint propagation only, never scale, never sets hasBeenEdited).
 */
export function dragPoint(
  path: WirePath,
  targetPointId: string,
  newX: number,
  newY: number
): WirePath {
  return applyConstraintPropagationXY(path, targetPointId, newX, newY)
}

/**
 * Drag a segment by moving both endpoints with constraint propagation.
 */
export function dragSegment(
  path: WirePath,
  fromPointId: string,
  newFromX: number,
  newFromY: number,
  toPointId: string,
  newToX: number,
  newToY: number
): WirePath {
  const after1 = applyConstraintPropagationXY(path, fromPointId, newFromX, newFromY)
  return applyConstraintPropagationXY(after1, toPointId, newToX, newToY)
}

/**
 * Rename a path.
 */
export function renamePath(path: WirePath, name: string): WirePath {
  return { ...path, name, updatedAt: Date.now() }
}
