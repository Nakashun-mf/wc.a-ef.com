import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Canvas } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store/appStore'
import type { WirePath } from '@/domain/types'

const canvasRect = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  right: 600,
  bottom: 400,
  width: 600,
  height: 400,
  toJSON: () => ({}),
} as DOMRect

function makePath(points: WirePath['points'], segments: WirePath['segments'] = []): WirePath {
  return {
    id: 'path-1',
    name: 'test path',
    createdAt: 0,
    updatedAt: 0,
    points,
    segments,
    hasBeenEdited: false,
  }
}

function resetStore(currentPath: WirePath) {
  useAppStore.setState({
    currentPath,
    paths: {},
    undoStack: [],
    redoStack: [],
    orthoMode: false,
    snapEnabled: false,
    gridVisible: false,
    selectedPointId: null,
    selectedSegmentId: null,
    simulation: {
      running: false,
      speedMmPerSec: 10,
      progress: 0,
      trailProgress: 0,
    },
  })
}

beforeAll(() => {
  class MockResizeObserver {
    private callback: ResizeObserverCallback

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }

    observe() {
      this.callback(
        [
          {
            contentRect: { width: 600, height: 400 },
          } as unknown as ResizeObserverEntry,
        ],
        {} as ResizeObserver
      )
    }

    unobserve() {}

    disconnect() {}
  }

  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue(canvasRect)
})

beforeEach(() => {
  resetStore(makePath([]))
})

afterEach(() => {
  cleanup()
})

describe('Canvas tap interactions', () => {
  it('adds a point when tapping empty canvas space', async () => {
    const { container } = render(<Canvas />)
    const svg = container.querySelector('svg')

    expect(svg).not.toBeNull()
    await waitFor(() => expect(svg).toHaveAttribute('width', '600'))

    fireEvent.pointerUp(svg!, { button: 0, clientX: 320, clientY: 180 })

    const { currentPath } = useAppStore.getState()
    expect(currentPath.points).toHaveLength(1)
    expect(currentPath.points[0]).toMatchObject({ x: 1, y: 1 })
  })

  it('adds a point for touch pointerup events without a primary mouse button', async () => {
    const { container } = render(<Canvas />)
    const svg = container.querySelector('svg')

    expect(svg).not.toBeNull()
    await waitFor(() => expect(svg).toHaveAttribute('width', '600'))

    fireEvent.pointerUp(svg!, { pointerType: 'touch', button: -1, clientX: 320, clientY: 180 })

    const { currentPath } = useAppStore.getState()
    expect(currentPath.points).toHaveLength(1)
    expect(currentPath.points[0]).toMatchObject({ x: 1, y: 1 })
  })

  it('selects an existing point without adding another point', async () => {
    resetStore(makePath([{ id: 'p1', x: 0, y: 0, freePlaced: false }]))

    const { container } = render(<Canvas />)
    const hitArea = await waitFor(() => {
      const element = container.querySelector('circle[fill="transparent"]')
      expect(element).not.toBeNull()
      expect(element).toHaveAttribute('cx', '300')
      return element
    })

    fireEvent.pointerDown(hitArea!, { button: 0, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(hitArea!, { button: 0, clientX: 300, clientY: 200 })
    fireEvent.click(hitArea!)

    const { currentPath, selectedPointId } = useAppStore.getState()
    expect(currentPath.points).toHaveLength(1)
    expect(selectedPointId).toBe('p1')
  })

  it('selects an existing segment without adding another point', async () => {
    resetStore(
      makePath(
        [
          { id: 'p1', x: -1, y: 0, freePlaced: false },
          { id: 'p2', x: 1, y: 0, freePlaced: false },
        ],
        [
          {
            id: 's1',
            fromPointId: 'p1',
            toPointId: 'p2',
            orientation: 'horizontal',
            isConstrained: true,
          },
        ]
      )
    )

    const { container } = render(<Canvas />)
    const hitArea = await waitFor(() => {
      const element = container.querySelector('line[stroke="transparent"]')
      expect(element).not.toBeNull()
      return element
    })

    fireEvent.pointerUp(hitArea!, { button: 0, clientX: 300, clientY: 200 })
    fireEvent.click(hitArea!)

    const { currentPath, selectedSegmentId } = useAppStore.getState()
    expect(currentPath.points).toHaveLength(2)
    expect(selectedSegmentId).toBe('s1')
  })
})
