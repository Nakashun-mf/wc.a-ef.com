import { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useCanvasTransform } from '@/hooks/useCanvasTransform'
import { Grid } from './Grid'
import { PathLayer } from './PathLayer'
import { SimulationLayer } from './SimulationLayer'

const LONG_PRESS_MS = 500
const DRAG_THRESHOLD_PX = 6
const INITIAL_SCALE = 20 // 20 px per mm

interface CanvasProps {
  onPointLongPress?: (pointId: string) => void
  onSegmentLongPress?: (segmentId: string) => void
  onPointClick?: (pointId: string) => void
}

export function Canvas({ onPointLongPress, onSegmentLongPress, onPointClick }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 600, height: 400 })

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

  const { transform, setTransform, zoom, panStart, panMove, panEnd, reset, canvasToWorld, worldToCanvas } =
    useCanvasTransform(INITIAL_SCALE)

  // Drag state for points
  const dragState = useRef<{
    active: boolean
    pointId: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  // Long-press timers
  const pointLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const segmentLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pan state (middle mouse or space+drag)
  const panActive = useRef(false)
  const spaceHeld = useRef(false)

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

  // Initialize canvas origin at center on first mount / size change
  useEffect(() => {
    if (size.width > 0) reset(size.width, size.height)
  }, [size.width]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: space for pan
  useEffect(() => {
    const dn = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); spaceHeld.current = true } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') spaceHeld.current = false }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  const clearPointLongPress = useCallback(() => {
    if (pointLongPressTimer.current) {
      clearTimeout(pointLongPressTimer.current)
      pointLongPressTimer.current = null
    }
  }, [])

  const clearSegmentLongPress = useCallback(() => {
    if (segmentLongPressTimer.current) {
      clearTimeout(segmentLongPressTimer.current)
      segmentLongPressTimer.current = null
    }
  }, [])

  // ── SVG root pointer handlers ─────────────────────────────────────────────

  const handleSvgPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button === 1 || spaceHeld.current) {
        e.preventDefault()
        panActive.current = true
        panStart(e.clientX, e.clientY)
      }
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
          clearPointLongPress()
        }
        if (dragState.current.moved) {
          const rect = svgRef.current!.getBoundingClientRect()
          const { x, y } = canvasToWorld(e.clientX - rect.left, e.clientY - rect.top)
          storeDragPoint(dragState.current.pointId, x, y)
        }
      }
    },
    [panMove, canvasToWorld, storeDragPoint, clearPointLongPress]
  )

  const handleSvgPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (panActive.current) {
        panActive.current = false
        panEnd()
        return
      }

      // If we were handling a point interaction (drag or tap-on-point), do NOT add a new point.
      // Point selection is handled by the PointMarker's own onClick.
      if (dragState.current?.active) {
        dragState.current = null
        clearPointLongPress()
        return
      }

      if (e.button !== 0) return

      const rect = svgRef.current!.getBoundingClientRect()
      const pxX = e.clientX - rect.left
      const pxY = e.clientY - rect.top

      if (currentPath.points.length === 0) {
        // P1 = origin: move canvas origin to the tapped position, place P1 at (0,0)
        setTransform(prev => ({ ...prev, offsetX: pxX, offsetY: pxY }))
        addPointAction(0, 0)
      } else {
        const { x: mmX, y: mmY } = canvasToWorld(pxX, pxY)
        addPointAction(mmX, mmY)
      }

      selectPoint(null)
      selectSegment(null)
    },
    [panEnd, currentPath.points.length, canvasToWorld, addPointAction, selectPoint, selectSegment, clearPointLongPress, setTransform]
  )

  // Wheel zoom (PC)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = svgRef.current!.getBoundingClientRect()
      zoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top)
    },
    [zoom]
  )

  // ── Point interactions ────────────────────────────────────────────────────

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
      pointLongPressTimer.current = setTimeout(() => {
        if (dragState.current && !dragState.current.moved) {
          onPointLongPress?.(pointId)
          dragState.current = null
        }
        pointLongPressTimer.current = null
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

  // ── Segment interactions ──────────────────────────────────────────────────

  const handleSegmentPointerDown = useCallback(
    (segmentId: string, e: React.PointerEvent) => {
      e.stopPropagation()
      segmentLongPressTimer.current = setTimeout(() => {
        onSegmentLongPress?.(segmentId)
        segmentLongPressTimer.current = null
      }, LONG_PRESS_MS)
    },
    [onSegmentLongPress]
  )

  const handleSegmentClick = useCallback(
    (segmentId: string) => {
      clearSegmentLongPress()
      selectSegment(segmentId)
    },
    [selectSegment, clearSegmentLongPress]
  )

  const handleSegmentPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      clearSegmentLongPress()
    },
    [clearSegmentLongPress]
  )

  // Right-click on segment → release constraint (PC convenience)
  const handleSegmentContextMenu = useCallback(
    (segmentId: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onSegmentLongPress?.(segmentId)
    },
    [onSegmentLongPress]
  )

  // ── Pinch zoom (mobile) ───────────────────────────────────────────────────

  const lastPinchDist = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault()
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

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[var(--paper-2)]">
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="absolute inset-0 touch-none select-none"
        style={{ cursor: spaceHeld.current || panActive.current ? 'grab' : 'crosshair' }}
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerLeave={handleSvgPointerUp}
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

        {simulation.running || simulation.progress >= 1 ? (
          <>
            <PathLayer
              path={currentPath}
              selectedPointId={null}
              selectedSegmentId={null}
              transform={transform}
              onPointClick={() => {}}
              onPointDragStart={() => {}}
              onSegmentPointerDown={() => {}}
              onSegmentClick={() => {}}
              onSegmentPointerUp={() => {}}
              onSegmentContextMenu={() => {}}
            />
            <SimulationLayer
              path={currentPath}
              progress={simulation.progress}
              transform={transform}
            />
          </>
        ) : (
          <PathLayer
            path={currentPath}
            selectedPointId={selectedPointId}
            selectedSegmentId={selectedSegmentId}
            transform={transform}
            onPointClick={handlePointClick}
            onPointDragStart={handlePointDragStart}
            onSegmentPointerDown={handleSegmentPointerDown}
            onSegmentClick={handleSegmentClick}
            onSegmentPointerUp={handleSegmentPointerUp}
            onSegmentContextMenu={handleSegmentContextMenu}
          />
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
