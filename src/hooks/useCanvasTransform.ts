import { useState, useCallback, useRef } from 'react'

export interface CanvasTransform {
  scale: number
  offsetX: number
  offsetY: number
}

const MIN_SCALE = 0.2
const MAX_SCALE = 10
const SCROLL_SENSITIVITY = 0.001

export function useCanvasTransform(initialScale = 1) {
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0,
  })

  const isPanning = useRef(false)
  const lastPanPos = useRef({ x: 0, y: 0 })

  const zoom = useCallback((delta: number, cx: number, cy: number) => {
    setTransform(prev => {
      const factor = 1 - delta * SCROLL_SENSITIVITY
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor))
      const ratio = newScale / prev.scale
      return {
        scale: newScale,
        offsetX: cx - ratio * (cx - prev.offsetX),
        offsetY: cy - ratio * (cy - prev.offsetY),
      }
    })
  }, [])

  const panStart = useCallback((x: number, y: number) => {
    isPanning.current = true
    lastPanPos.current = { x, y }
  }, [])

  const panMove = useCallback((x: number, y: number) => {
    if (!isPanning.current) return
    const dx = x - lastPanPos.current.x
    const dy = y - lastPanPos.current.y
    lastPanPos.current = { x, y }
    setTransform(prev => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }))
  }, [])

  const panEnd = useCallback(() => {
    isPanning.current = false
  }, [])

  const reset = useCallback((canvasWidth: number, canvasHeight: number) => {
    setTransform({
      scale: initialScale,
      offsetX: canvasWidth / 2,
      offsetY: canvasHeight / 2,
    })
  }, [initialScale])

  /**
   * Convert canvas pixel to world mm coordinate.
   * Origin (0,0) is at (offsetX, offsetY) in canvas coords.
   * mmPerPx = 1/scale (1 unit = 1mm, scale px/mm)
   */
  const canvasToWorld = useCallback(
    (px: number, py: number): { x: number; y: number } => {
      return {
        x: (px - transform.offsetX) / transform.scale,
        y: -((py - transform.offsetY) / transform.scale),
      }
    },
    [transform]
  )

  /**
   * Convert world mm coordinate to canvas pixel.
   */
  const worldToCanvas = useCallback(
    (wx: number, wy: number): { x: number; y: number } => {
      return {
        x: transform.offsetX + wx * transform.scale,
        y: transform.offsetY - wy * transform.scale,
      }
    },
    [transform]
  )

  return {
    transform,
    setTransform,
    zoom,
    panStart,
    panMove,
    panEnd,
    reset,
    canvasToWorld,
    worldToCanvas,
    isPanning,
  }
}
