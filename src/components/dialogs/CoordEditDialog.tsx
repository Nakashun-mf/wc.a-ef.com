import { useState } from 'react'
import { Trash2, Unlink, ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { getConstrainedPointIds, roundToDisplay } from '@/domain/utils'
import type { Point } from '@/domain/types'

interface CoordEditDialogProps {
  point: Point
  pointIndex: number
  onClose: () => void
  onDelete: () => void
}

export function CoordEditDialog({ point, pointIndex, onClose, onDelete }: CoordEditDialogProps) {
  const { t } = useTranslation()
  const editCoordinate = useAppStore(s => s.editCoordinate)
  const releaseConstraint = useAppStore(s => s.releaseConstraint)
  const currentPath = useAppStore(s => s.currentPath)

  const [xVal, setXVal] = useState(roundToDisplay(point.x).toFixed(2))
  const [yVal, setYVal] = useState(roundToDisplay(point.y).toFixed(2))
  const [xErr, setXErr] = useState(false)
  const [yErr, setYErr] = useState(false)

  const constrainedIds = getConstrainedPointIds(currentPath)
  const isConstrained = constrainedIds.has(point.id)

  const constrainedSegments = currentPath.segments.filter(
    s => s.isConstrained && (s.fromPointId === point.id || s.toPointId === point.id)
  )

  const handleConfirm = () => {
    const x = parseFloat(xVal)
    const y = parseFloat(yVal)
    let hasErr = false
    if (isNaN(x)) { setXErr(true); hasErr = true }
    if (isNaN(y)) { setYErr(true); hasErr = true }
    if (hasErr) return

    if (x !== point.x) editCoordinate(point.id, 'x', x)
    if (y !== point.y) editCoordinate(point.id, 'y', y)
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={v => !v && onClose()}
      title={`P${pointIndex + 1} ${t('edit.title')}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {(['x', 'y'] as const).map(axis => {
            const val = axis === 'x' ? xVal : yVal
            const setVal = axis === 'x' ? setXVal : setYVal
            const err = axis === 'x' ? xErr : yErr
            const setErr = axis === 'x' ? setXErr : setYErr
            const step = (dir: 1 | -1) => {
              const n = parseFloat(val)
              const next = isNaN(n) ? dir : Math.round((n + dir) * 100) / 100
              setVal(next.toFixed(2))
              setErr(false)
            }
            return (
              <label key={axis}>
                <span className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1.5">
                  {axis.toUpperCase()} (mm)
                </span>
                <div className="flex items-stretch gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={val}
                    onChange={e => { setVal(e.target.value); setErr(false) }}
                    onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    className={`flex-1 min-w-0 px-3 py-2 text-[14px] font-mono bg-[var(--surface)] border rounded-[var(--r-md)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)] transition-colors ${
                      err
                        ? 'border-[var(--danger)] focus:ring-[var(--danger)]'
                        : 'border-[var(--line-2)] focus:border-[var(--signal)]'
                    }`}
                  />
                  <div className="flex flex-col gap-px">
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="flex-1 px-2 flex items-center justify-center rounded-t-[var(--r-md)] border border-[var(--line-2)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:bg-[var(--surface-3)] text-[var(--ink-2)] transition-colors"
                    >
                      <ChevronUp size={13} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="flex-1 px-2 flex items-center justify-center rounded-b-[var(--r-md)] border border-[var(--line-2)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:bg-[var(--surface-3)] text-[var(--ink-2)] transition-colors"
                    >
                      <ChevronDown size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                {err && (
                  <p className="text-[12px] text-[var(--danger)] mt-1">{t('errors.invalidNumber')}</p>
                )}
              </label>
            )
          })}
        </div>

        {isConstrained && constrainedSegments.length > 0 && (
          <div>
            <p className="text-[12px] text-[var(--ink-3)] mb-2">
              {t('edit.releaseConstraint')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {constrainedSegments.map(seg => {
                const otherPointId = seg.fromPointId === point.id ? seg.toPointId : seg.fromPointId
                const otherIdx = currentPath.points.findIndex(p => p.id === otherPointId)
                return (
                  <Button
                    key={seg.id}
                    size="sm"
                    variant="ghost"
                    className="text-[var(--warn)] border border-[var(--warn-line)] bg-[var(--warn-wash)]"
                    onClick={() => {
                      releaseConstraint(seg.id)
                      onClose()
                    }}
                  >
                    <Unlink size={12} strokeWidth={1.75} />
                    {seg.orientation === 'horizontal' ? 'H' : 'V'} → P{otherIdx + 1}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
          <Button
            size="sm"
            variant="ghost"
            className="text-[var(--danger)]"
            onClick={onDelete}
          >
            <Trash2 size={14} strokeWidth={1.75} />
            {t('edit.deletePoint')}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('edit.cancel')}
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              {t('edit.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
