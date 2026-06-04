import { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useCanvasTransform } from '@/hooks/useCanvasTransform'
import { Grid } from './Grid'
import { PathLayer } from './PathLayer'
import { SimulationLayer } from './SimulationLayer'

const LONG_PRESS_MS = 500
const DRAG_THRESHOLD_PX = 10
const INITIAL_SCALE = 20 // 20px per mm = 1mm on screen is 20px
const INTERACTIVE_CANVAS_SELECTOR = '[data-canvas-interactive="true"]'

interface CanvasProps {
  onPointLongPress?: (pointId: string) => void
  onPointClick?: (pointId: string) => void
}

export function Canvas({ onPointLongPress, onPointClick }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [isPanningCursor, setIsPanningCursor] = useState(false)

  const currentPath = useAppStore(s => s.currentPath)
  const selectedPointId = useAppStore(s => s.selectedPointId)
  const selectedSegmentId = useAppStore(s => s.selectedSegmentId)
  const gridVisible = useAppStore(s => s.gridVisible)
  const gridSizeMm = useAppStore(s => s.gridSizeMm)
  const simulation = useAppStore(s => s.simulation)
  const addPointAction = useAppStore(s => s.addPoint)
  const selectPoint = useAppStore(s => s.selectPoint)
  const selectSegment = useAppStore(s => s.selectSegment)
  const storeDragPoint = useAppStore(s => s.dragPoint)

  const { transform, zoom, panStart, panMove, panEnd, reset, canvasToWorld, worldToCanvas } =
    useCanvasTransform(INITIAL_SCALE)

  // Track drag state
  const dragState = useRef<{
    active: boolean
    pointId: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTarget = useRef<{ type: 'point' | 'segment'; id: string } | null>(null)

  // Pan state (middle mouse / space+drag)
  const panActive = useRef(false)
  const spaceHeld = useRef(false)

  // Deduplication: did handleTouchEnd already fire for the current touch?
  const touchHandled = useRef(false)

  // Observe container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Initialize origin to center on first mount / size change
  useEffect(() => {
    if (size.width > 0) reset(size.width, size.height)
  }, [size.width]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard pan
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') spaceHeld.current = true }
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') spaceHeld.current = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    longPressTarget.current = null
  }, [])

  const dbg = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true'

  // Document-level debug: see if events reach the document at all, and what element is hit
  useEffect(() => {
    if (!dbg) return
    const onDown = (e: PointerEvent) => {
      const stack = document.elementsFromPoint(e.clientX, e.clientY)
      console.log('[doc] pointerdown', e.pointerType, 'stack:', stack.map(el => {
        const cls = el.className?.toString().slice(0, 40)
        const ds = Object.keys((el as HTMLElement).dataset ?? {}).map(k => `data-${k}`).join(' ')
        return `${el.tagName}${cls ? '[' + cls + ']' : ''}${ds ? '{' + ds + '}' : ''}`
      }).join(' > '))
    }
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointerdown', onDown)
    }
  }, [dbg])

  // ── SVG event handlers ───────────────────────────────────────────────────

  const addPointAtClientPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (dbg) console.log('[canvas] addPoint', { clientX, clientY })
      const rect = svgRef.current!.getBoundingClientRect()
      const { x: mmX, y: mmY } = canvasToWorld(clientX - rect.left, clientY - rect.top)
      addPointAction(mmX, mmY)
      selectPoint(null)
      selectSegment(null)
    },
    [canvasToWorld, addPointAction, selectPoint, selectSegment, dbg]
  )

  const handleSvgPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (dbg) console.log('[canvas] pointerDown', { type: e.pointerType, button: e.button })
      if (e.button === 1 || spaceHeld.current) {
        // Middle button or space: pan
        e.preventDefault()
        panActive.current = true
        setIsPanningCursor(true)
        panStart(e.clientX, e.clientY)
        return
      }
      // No-op; point/segment handlers take priority
    },
    [panStart]
  )

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (panActive.current) {
        panMove(e.clientX, e.clientY)
        return
      }
      if (dragState.current?.active) {
        const dx = e.clientX - dragState.current.startX
        const dy = e.clientY - dragState.current.startY
        if (!dragState.current.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          dragState.current.moved = true
          clearLongPress()
        }
        if (dragState.current.moved) {
          const rect = svgRef.current!.getBoundingClientRect()
          const { x: mmX, y: mmY } = canvasToWorld(e.clientX - rect.left, e.clientY - rect.top)
          storeDragPoint(dragState.current.pointId, mmX, mmY)
        }
      }
    },
    [panMove, canvasToWorld, storeDragPoint, clearLongPress]
  )

  const handleSvgPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (dbg) console.log('[canvas] pointerUp', { type: e.pointerType, button: e.button, touchHandled: touchHandled.current })
      if (panActive.current) {
        panActive.current = false
        setIsPanningCursor(false)
        panEnd()
        return
      }

      if (dragState.current?.active) {
        dragState.current = null
        clearLongPress()
        return
      }

      // If touchend already fired for this tap, skip (real browsers fire
      // touchend before pointerup). If touchend never fired (pointer-only
      // environments), fall through so the point still gets added.
      if (e.pointerType === 'touch') {
        if (touchHandled.current) return
      }
      // Only reject explicit non-primary mouse buttons.
      if (e.pointerType === 'mouse' && e.button !== 0) return
      addPointAtClientPosition(e.clientX, e.clientY)
    },
    [panEnd, addPointAtClientPosition, clearLongPress]
  )

  // Separate pointerleave handler: only cancels pan/drag, never adds points.
  // On mobile, pointerleave fires when a touch ends (the touch pointer is removed),
  // so reusing handleSvgPointerUp here would incorrectly add extra points.
  const handleSvgPointerLeave = useCallback(
    (_e: React.PointerEvent<SVGSVGElement>) => {
      if (panActive.current) {
        panActive.current = false
        setIsPanningCursor(false)
        panEnd()
      }
      if (dragState.current?.active) {
        dragState.current = null
        clearLongPress()
      }
    },
    [panEnd, clearLongPress]
  )

  // Wheel zoom (PC only)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = svgRef.current!.getBoundingClientRect()
      zoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top)
    },
    [zoom]
  )

  // ── Point drag start ──────────────────────────────────────────────────────

  const handlePointDragStart = useCallback(
    (pointId: string, e: React.PointerEvent) => {
      e.stopPropagation()
      dragState.current = {
        active: true,
        pointId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      }
      // Long press detection
      longPressTarget.current = { type: 'point', id: pointId }
      longPressTimer.current = setTimeout(() => {
        if (!dragState.current?.moved) {
          onPointLongPress?.(pointId)
          dragState.current = null
        }
        longPressTarget.current = null
      }, LONG_PRESS_MS)
    },
    [onPointLongPress]
  )

  const handlePointClick = useCallback(
    (pointId: string) => {
      selectPoint(pointId)
      onPointClick?.(pointId)
    },
    [selectPoint, onPointClick]
  )

  const handleSegmentClick = useCallback(
    (segmentId: string) => {
      selectSegment(segmentId)
    },
    [selectSegment]
  )

  // Pinch zoom (mobile)
  const lastPinchDist = useRef<number | null>(null)
  const singleTouchStart = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (dbg) console.log('[canvas] touchStart', e.touches.length, 'touches')
    touchHandled.current = false
    if (e.touches.length === 1) {
      singleTouchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        moved: false,
      }
      return
    }

    singleTouchStart.current = null
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && singleTouchStart.current) {
        const dx = e.touches[0].clientX - singleTouchStart.current.x
        const dy = e.touches[0].clientY - singleTouchStart.current.y
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          singleTouchStart.current.moved = true
        }
      }

      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault()
        singleTouchStart.current = null
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const newDist = Math.hypot(dx, dy)
        const ratio = lastPinchDist.current / newDist
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const rect = svgRef.current!.getBoundingClientRect()
        zoom((ratio - 1) * 1000, cx - rect.left, cy - rect.top)
        lastPinchDist.current = newDist
      }
    },
    [zoom]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (dbg) console.log('[canvas] touchEnd', { start: singleTouchStart.current, target: (e.target as Element)?.tagName })
      touchHandled.current = true
      if (lastPinchDist.current !== null) {
        lastPinchDist.current = null
        singleTouchStart.current = null
        return
      }

      const touch = e.changedTouches[0]
      const start = singleTouchStart.current
      singleTouchStart.current = null
      if (!touch || !start || start.moved) return

      const target = e.target
      if (target instanceof Element && target.closest(INTERACTIVE_CANVAS_SELECTOR)) return

      addPointAtClientPosition(touch.clientX, touch.clientY)
    },
    [addPointAtClientPosition]
  )


  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[var(--paper-2)]">
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="absolute inset-0 touch-none"
        style={{ cursor: isPanningCursor ? 'grabbing' : 'crosshair' }}
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerLeave={handleSvgPointerLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {gridVisible && (
          <Grid
            transform={transform}
            gridSizeMm={gridSizeMm}
            width={size.width}
            height={size.height}
          />
        )}

        {!simulation.running && simulation.progress < 1 ? (
          <PathLayer
            path={currentPath}
            selectedPointId={selectedPointId}
            selectedSegmentId={selectedSegmentId}
            transform={transform}
            onPointClick={handlePointClick}
            onSegmentClick={handleSegmentClick}
            onPointDragStart={handlePointDragStart}
            onSegmentPointerDown={() => {}}
            onSegmentPointerUp={() => {}}
            onSegmentContextMenu={() => {}}
          />
        ) : (
          <>
            <PathLayer
              path={currentPath}
              selectedPointId={null}
              selectedSegmentId={null}
              transform={transform}
              onPointClick={() => {}}
              onSegmentClick={() => {}}
              onPointDragStart={() => {}}
              onSegmentPointerDown={() => {}}
              onSegmentPointerUp={() => {}}
              onSegmentContextMenu={() => {}}
            />
            <SimulationLayer
              path={currentPath}
              progress={simulation.progress}
              transform={transform}
            />
          </>
        )}

        {/* Origin label */}
        {(() => {
          const o = worldToCanvas(0, 0)
          return (
            <text
              x={o.x + 6}
              y={o.y - 4}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="var(--ink-4)"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              (0, 0)
            </text>
          )
        })()}
      </svg>
    </div>
  )
}
