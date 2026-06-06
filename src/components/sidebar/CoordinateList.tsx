import { useState } from 'react'
import { Link, Trash2, Unlink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { getConstrainedPointIds, roundToDisplay } from '@/domain/utils'
import { Button } from '@/components/ui/Button'
import { CoordEditDialog } from '@/components/dialogs/CoordEditDialog'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Point } from '@/domain/types'

interface EditState {
  pointId: string
  x: string
  y: string
}

export function CoordinateList() {
  const { t } = useTranslation()
  const currentPath = useAppStore(s => s.currentPath)
  const selectedPointId = useAppStore(s => s.selectedPointId)
  const selectPoint = useAppStore(s => s.selectPoint)
  const editCoordinate = useAppStore(s => s.editCoordinate)
  const deletePoint = useAppStore(s => s.deletePoint)
  const releaseConstraintsByPoint = useAppStore(s => s.releaseConstraintsByPoint)

  const [editDialog, setEditDialog] = useState<{ point: Point } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [releaseConfirm, setReleaseConfirm] = useState<string | null>(null)

  const constrainedIds = getConstrainedPointIds(currentPath)

  if (currentPath.points.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{t('sidebar.noPoints')}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-[var(--surface)] z-10">
          <tr className="border-b border-[var(--line)]">
            <th className="text-left px-3 py-2 font-medium text-[var(--ink-3)] font-mono text-[11px] uppercase tracking-wider w-12">
              #
            </th>
            <th className="text-right px-2 py-2 font-medium text-[var(--ink-3)] font-mono text-[11px] uppercase tracking-wider">
              X (mm)
            </th>
            <th className="text-right px-2 py-2 font-medium text-[var(--ink-3)] font-mono text-[11px] uppercase tracking-wider">
              Y (mm)
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {currentPath.points.map((point, idx) => {
            const isSelected = point.id === selectedPointId
            const isConstrained = constrainedIds.has(point.id)
            return (
              <tr
                key={point.id}
                className={`border-b border-[var(--line)] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--signal-wash)]'
                    : 'hover:bg-[var(--surface-2)]'
                }`}
                onClick={() => {
                  selectPoint(isSelected ? null : point.id)
                }}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-mono font-medium ${isSelected ? 'text-[var(--signal-ink)]' : 'text-[var(--ink-2)]'}`}
                    >
                      P{idx + 1}
                    </span>
                    {isConstrained && (
                      <Link size={11} className="text-[var(--signal-ink)]" strokeWidth={1.75} />
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 text-right font-mono text-[var(--ink)]">
                  {roundToDisplay(point.x).toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right font-mono text-[var(--ink)]">
                  {roundToDisplay(point.y).toFixed(2)}
                </td>
                <td className="px-1 py-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:!opacity-100"
                    onClick={e => {
                      e.stopPropagation()
                      setEditDialog({ point })
                    }}
                  >
                    <span className="text-[11px] text-[var(--ink-3)]">…</span>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Per-row edit — double-click on value */}
      <div className="px-3 py-3">
        {currentPath.points.map((point, idx) => {
          const isSelected = selectedPointId === point.id
          const isConstrained = constrainedIds.has(point.id)
          if (!isSelected) return null
          return (
            <div key={point.id} className="rounded-[var(--r-md)] border border-[var(--signal-line)] bg-[var(--signal-wash)] p-3 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold text-[var(--signal-ink)] text-[13px]">P{idx + 1} を編集</span>
                <div className="flex items-center gap-0.5">
                  {isConstrained && (
                    <Tooltip content={t('edit.releaseConstraint')} side="left">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setReleaseConfirm(point.id)}
                      >
                        <Unlink size={12} className="text-[var(--signal-ink)]" strokeWidth={1.75} />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content={t('edit.deletePoint')} side="left">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setDeleteConfirm(point.id)}
                    >
                      <Trash2 size={13} className="text-[var(--danger)]" strokeWidth={1.75} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <InlineCoordEdit
                point={point}
                onEdit={(axis, val) => editCoordinate(point.id, axis, val)}
              />
            </div>
          )
        })}
      </div>

      {editDialog && (
        <CoordEditDialog
          point={editDialog.point}
          pointIndex={currentPath.points.findIndex(p => p.id === editDialog.point.id)}
          onClose={() => setEditDialog(null)}
          onDelete={() => {
            setDeleteConfirm(editDialog.point.id)
            setEditDialog(null)
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title={t('confirm.deletePoint')}
          description={t('confirm.deletePointDesc')}
          onConfirm={() => {
            deletePoint(deleteConfirm)
            setDeleteConfirm(null)
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {releaseConfirm && (
        <ConfirmDialog
          title={t('confirm.releaseConstraint')}
          description={t('confirm.releaseConstraintDesc')}
          onConfirm={() => {
            releaseConstraintsByPoint(releaseConfirm)
            setReleaseConfirm(null)
          }}
          onCancel={() => setReleaseConfirm(null)}
        />
      )}
    </div>
  )
}

interface InlineCoordEditProps {
  point: Point
  onEdit: (axis: 'x' | 'y', value: number) => void
}

function InlineCoordEdit({ point, onEdit }: InlineCoordEditProps) {
  const [editState, setEditState] = useState<EditState>({
    pointId: point.id,
    x: roundToDisplay(point.x).toFixed(2),
    y: roundToDisplay(point.y).toFixed(2),
  })

  const handleBlur = (axis: 'x' | 'y') => {
    const raw = axis === 'x' ? editState.x : editState.y
    const val = parseFloat(raw)
    if (!isNaN(val)) {
      onEdit(axis, val)
      setEditState(prev => ({
        ...prev,
        [axis]: roundToDisplay(val).toFixed(2),
      }))
    } else {
      setEditState(prev => ({
        ...prev,
        [axis]: roundToDisplay(point[axis]).toFixed(2),
      }))
    }
  }

  return (
    <div className="flex gap-2">
      {(['x', 'y'] as const).map(axis => (
        <label key={axis} className="flex-1">
          <span className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1">
            {axis.toUpperCase()} mm
          </span>
          <input
            type="number"
            step="0.01"
            value={editState[axis]}
            onChange={e =>
              setEditState(prev => ({ ...prev, [axis]: e.target.value }))
            }
            onBlur={() => handleBlur(axis)}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            className="w-full px-2 py-1.5 text-[13px] font-mono bg-[var(--surface)] border border-[var(--line-2)] rounded-[var(--r-sm)] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)] focus:ring-1 focus:ring-[var(--signal)]"
          />
        </label>
      ))}
    </div>
  )
}
