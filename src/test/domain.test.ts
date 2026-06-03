import { describe, it, expect } from 'vitest'
import type { WirePath } from '@/domain/types'
import { applyScale } from '@/domain/scale'
import { applyConstraintPropagation, applyConstraintPropagationXY } from '@/domain/constraints'
import { editCoordinate, dragPoint } from '@/domain/path'
import { approxEqual } from '@/domain/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePoint(id: string, x: number, y: number, freePlaced = false) {
  return { id, x, y, freePlaced }
}

function makeSeg(
  id: string,
  from: string,
  to: string,
  orientation: 'horizontal' | 'vertical' | 'free',
  isConstrained: boolean
) {
  return { id, fromPointId: from, toPointId: to, orientation, isConstrained }
}

function makeConstrainedPath(
  points: ReturnType<typeof makePoint>[],
  segments: ReturnType<typeof makeSeg>[],
  hasBeenEdited = false
): WirePath {
  return {
    id: 'test',
    name: 'test',
    createdAt: 0,
    updatedAt: 0,
    points,
    segments,
    hasBeenEdited,
  }
}

function px(path: WirePath, id: string) {
  return path.points.find(p => p.id === id)!
}

// ── Example 1: Horizontal segment Y propagation ───────────────────────────────

describe('Example 1: P1(0,0)→P2(0,10)→P3(20,10) — edit P2.Y 10→15', () => {
  const path = makeConstrainedPath(
    [makePoint('p1', 0, 0), makePoint('p2', 0, 10), makePoint('p3', 20, 10)],
    [
      makeSeg('s1', 'p1', 'p2', 'vertical', true),
      makeSeg('s2', 'p2', 'p3', 'horizontal', true),
    ],
    true
  )

  it('P3 Y becomes 15', () => {
    const result = applyConstraintPropagation(path, 'p2', 'y', 15)
    expect(approxEqual(px(result, 'p2').y, 15)).toBe(true)
    expect(approxEqual(px(result, 'p3').y, 15)).toBe(true)
  })

  it('P3 X is unchanged', () => {
    const result = applyConstraintPropagation(path, 'p2', 'y', 15)
    expect(approxEqual(px(result, 'p3').x, 20)).toBe(true)
  })

  it('via editCoordinate (hasBeenEdited=true)', () => {
    const result = editCoordinate(path, 'p2', 'y', 15)
    expect(approxEqual(px(result, 'p3').y, 15)).toBe(true)
  })
})

// ── Example 2: Vertical segment X propagation ────────────────────────────────

describe('Example 2: P1(0,0)→P2(10,0)→P3(10,20) — edit P2.X 10→15', () => {
  const path = makeConstrainedPath(
    [makePoint('p1', 0, 0), makePoint('p2', 10, 0), makePoint('p3', 10, 20)],
    [
      makeSeg('s1', 'p1', 'p2', 'horizontal', true),
      makeSeg('s2', 'p2', 'p3', 'vertical', true),
    ],
    true
  )

  it('P3 X becomes 15', () => {
    const result = applyConstraintPropagation(path, 'p2', 'x', 15)
    expect(approxEqual(px(result, 'p3').x, 15)).toBe(true)
  })

  it('P3 Y is unchanged', () => {
    const result = applyConstraintPropagation(path, 'p2', 'x', 15)
    expect(approxEqual(px(result, 'p3').y, 20)).toBe(true)
  })
})

// ── Example 3: Scale then propagation ────────────────────────────────────────

describe('Example 3: scale then constraint propagation', () => {
  const initialPath = makeConstrainedPath(
    [makePoint('p1', 0, 0), makePoint('p2', 0, 10), makePoint('p3', 20, 10)],
    [
      makeSeg('s1', 'p1', 'p2', 'vertical', true),
      makeSeg('s2', 'p2', 'p3', 'horizontal', true),
    ],
    false
  )

  it('1st edit P2→(0,20): scale ×2, P3 becomes (40,20)', () => {
    const result = editCoordinate(initialPath, 'p2', 'y', 20)
    expect(approxEqual(px(result, 'p1').x, 0)).toBe(true)
    expect(approxEqual(px(result, 'p1').y, 0)).toBe(true)
    expect(approxEqual(px(result, 'p2').x, 0)).toBe(true)
    expect(approxEqual(px(result, 'p2').y, 20)).toBe(true)
    expect(approxEqual(px(result, 'p3').x, 40)).toBe(true)
    expect(approxEqual(px(result, 'p3').y, 20)).toBe(true)
    expect(result.hasBeenEdited).toBe(true)
  })

  it('2nd edit P3.Y→50: P2 also becomes Y=50 via propagation', () => {
    const afterScale = editCoordinate(initialPath, 'p2', 'y', 20)
    const result = editCoordinate(afterScale, 'p3', 'y', 50)
    expect(approxEqual(px(result, 'p2').y, 50)).toBe(true)
    expect(approxEqual(px(result, 'p3').y, 50)).toBe(true)
    expect(approxEqual(px(result, 'p2').x, 0)).toBe(true)
    expect(approxEqual(px(result, 'p3').x, 40)).toBe(true)
  })
})

// ── Example 4: Chain propagation (the most important case) ───────────────────

describe('Example 4: P1(0,0)→P2(10,0)→P3(10,20)→P4(30,20)→P5(30,0) — edit P2.Y 0→10', () => {
  const path = makeConstrainedPath(
    [
      makePoint('p1', 0, 0),
      makePoint('p2', 10, 0),
      makePoint('p3', 10, 20),
      makePoint('p4', 30, 20),
      makePoint('p5', 30, 0),
    ],
    [
      makeSeg('s1', 'p1', 'p2', 'horizontal', true),
      makeSeg('s2', 'p2', 'p3', 'vertical', true),
      makeSeg('s3', 'p3', 'p4', 'horizontal', true),
      makeSeg('s4', 'p4', 'p5', 'vertical', true),
    ],
    true
  )

  it('P1, P2, P5 Y all become 10', () => {
    const result = applyConstraintPropagation(path, 'p2', 'y', 10)
    expect(approxEqual(px(result, 'p1').y, 10)).toBe(true)
    expect(approxEqual(px(result, 'p2').y, 10)).toBe(true)
    expect(approxEqual(px(result, 'p5').y, 10)).toBe(true)
  })

  it('P3 and P4 are unchanged', () => {
    const result = applyConstraintPropagation(path, 'p2', 'y', 10)
    expect(approxEqual(px(result, 'p3').y, 20)).toBe(true)
    expect(approxEqual(px(result, 'p4').y, 20)).toBe(true)
  })

  it('X values are all unchanged', () => {
    const result = applyConstraintPropagation(path, 'p2', 'y', 10)
    expect(approxEqual(px(result, 'p1').x, 0)).toBe(true)
    expect(approxEqual(px(result, 'p2').x, 10)).toBe(true)
    expect(approxEqual(px(result, 'p3').x, 10)).toBe(true)
    expect(approxEqual(px(result, 'p4').x, 30)).toBe(true)
    expect(approxEqual(px(result, 'p5').x, 30)).toBe(true)
  })
})

// ── Scale edge case: point at origin ────────────────────────────────────────

describe('Scale edge case: target at origin', () => {
  it('only updates the target point when it is at (0,0)', () => {
    const path = makeConstrainedPath(
      [makePoint('p1', 0, 0), makePoint('p2', 0, 10)],
      [makeSeg('s1', 'p1', 'p2', 'vertical', true)],
      false
    )
    const result = applyScale(path, 'p1', 'x', 5)
    expect(approxEqual(px(result, 'p1').x, 5)).toBe(true)
    // P2 should remain unchanged (distance-before is 0, no scale ratio)
    expect(approxEqual(px(result, 'p2').y, 10)).toBe(true)
  })
})

// ── Drag: constraint propagation without hasBeenEdited change ─────────────────

describe('Drag point: constraint propagation fires but hasBeenEdited stays unchanged', () => {
  it('drag does not consume the 1st edit slot', () => {
    const path = makeConstrainedPath(
      [makePoint('p1', 0, 0), makePoint('p2', 0, 10), makePoint('p3', 20, 10)],
      [
        makeSeg('s1', 'p1', 'p2', 'vertical', true),
        makeSeg('s2', 'p2', 'p3', 'horizontal', true),
      ],
      false
    )
    const result = dragPoint(path, 'p2', 0, 15)
    expect(result.hasBeenEdited).toBe(false)
    expect(approxEqual(px(result, 'p3').y, 15)).toBe(true)
  })
})

// ── Free-placed point: no propagation to others ───────────────────────────────

describe('Free-placed point: only itself updates', () => {
  it('editing a free point does not propagate to other free points with same value', () => {
    const path = makeConstrainedPath(
      [makePoint('p1', 0, 0, true), makePoint('p2', 0, 10, true)],
      [makeSeg('s1', 'p1', 'p2', 'free', false)],
      true
    )
    const result = applyConstraintPropagation(path, 'p1', 'y', 0)
    // p1 is free, p2 is free — no propagation between them
    expect(approxEqual(px(result, 'p2').y, 10)).toBe(true)
  })
})

// ── Dual-axis drag (Pattern B corner point) ───────────────────────────────────

describe('Pattern B corner drag: P2 at junction of H and V segments', () => {
  it('both X and Y propagate to their respective constrained partners', () => {
    // P1(0,0)→P2(10,0)[H]→P3(10,20)[V], P2 is at corner
    const path = makeConstrainedPath(
      [makePoint('p1', 0, 0), makePoint('p2', 10, 0), makePoint('p3', 10, 20)],
      [
        makeSeg('s1', 'p1', 'p2', 'horizontal', true),
        makeSeg('s2', 'p2', 'p3', 'vertical', true),
      ],
      true
    )
    const result = applyConstraintPropagationXY(path, 'p2', 15, 5)
    // P1 shares Y=0 with P2 → P1.Y = 5
    expect(approxEqual(px(result, 'p1').y, 5)).toBe(true)
    // P3 shares X=10 with P2 → P3.X = 15
    expect(approxEqual(px(result, 'p3').x, 15)).toBe(true)
    expect(approxEqual(px(result, 'p2').x, 15)).toBe(true)
    expect(approxEqual(px(result, 'p2').y, 5)).toBe(true)
  })
})
