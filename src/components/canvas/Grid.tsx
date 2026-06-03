import type { CanvasTransform } from '@/hooks/useCanvasTransform'

interface GridProps {
  transform: CanvasTransform
  gridSizeMm: number
  width: number
  height: number
}

export function Grid({ transform, gridSizeMm, width, height }: GridProps) {
  const pxPerMm = transform.scale
  const gridPx = gridSizeMm * pxPerMm

  if (gridPx < 4) return null

  const startX = ((transform.offsetX % gridPx) + gridPx) % gridPx
  const startY = ((transform.offsetY % gridPx) + gridPx) % gridPx

  const lines: React.ReactNode[] = []

  // Vertical lines
  for (let x = startX; x <= width; x += gridPx) {
    lines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="var(--grid-line)"
        strokeWidth={1}
      />
    )
  }

  // Horizontal lines
  for (let y = startY; y <= height; y += gridPx) {
    lines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="var(--grid-line)"
        strokeWidth={1}
      />
    )
  }

  // Axis lines (X and Y axes through origin)
  const ox = transform.offsetX
  const oy = transform.offsetY

  return (
    <g>
      {lines}
      {ox >= 0 && ox <= width && (
        <line x1={ox} y1={0} x2={ox} y2={height} stroke="var(--ink-4)" strokeWidth={1} />
      )}
      {oy >= 0 && oy <= height && (
        <line x1={0} y1={oy} x2={width} y2={oy} stroke="var(--ink-4)" strokeWidth={1} />
      )}
    </g>
  )
}
