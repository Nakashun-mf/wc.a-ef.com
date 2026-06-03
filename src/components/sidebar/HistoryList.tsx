import { useState } from 'react'
import { Clock, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'

export function HistoryList() {
  const { t } = useTranslation()
  const paths = useAppStore(s => s.paths)
  const currentPath = useAppStore(s => s.currentPath)
  const openPath = useAppStore(s => s.openPath)
  const renamePath = useAppStore(s => s.renamePath)
  const deleteHistoryEntry = useAppStore(s => s.deleteHistoryEntry)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sortedPaths = Object.values(paths)
    .filter(p => p.id !== currentPath.id || p.points.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  if (sortedPaths.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-[13px] text-[var(--ink-3)]">{t('sidebar.noHistory')}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[var(--line)]">
      {sortedPaths.map(path => {
        const isActive = path.id === currentPath.id
        const date = new Date(path.updatedAt)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

        return (
          <div
            key={path.id}
            className={`group flex items-start gap-2 px-3 py-3 transition-colors ${
              isActive ? 'bg-[var(--signal-wash)]' : 'hover:bg-[var(--surface-2)]'
            }`}
          >
            <Clock
              size={14}
              className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-[var(--signal-ink)]' : 'text-[var(--ink-3)]'}`}
              strokeWidth={1.75}
            />
            <div className="flex-1 min-w-0">
              {editingId === path.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => {
                    if (editName.trim()) renamePath(path.id, editName.trim())
                    setEditingId(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="w-full px-1.5 py-0.5 text-[13px] font-medium bg-[var(--surface)] border border-[var(--signal)] rounded-[var(--r-xs)] text-[var(--ink)] focus:outline-none"
                  placeholder={t('history.namePlaceholder')}
                />
              ) : (
                <p
                  className={`text-[13px] font-medium truncate cursor-pointer ${
                    isActive ? 'text-[var(--signal-ink)]' : 'text-[var(--ink)]'
                  }`}
                  onClick={() => !isActive && openPath(path.id)}
                >
                  {path.name}
                </p>
              )}
              <p className="text-[11px] font-mono text-[var(--ink-3)] mt-0.5">
                {dateStr} · {path.points.length}点
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setEditingId(path.id)
                  setEditName(path.name)
                }}
              >
                <Pencil size={12} strokeWidth={1.75} />
              </Button>
              {!isActive && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-[var(--danger)]"
                    onClick={() => setDeleteConfirm(path.id)}
                  >
                    <Trash2 size={12} strokeWidth={1.75} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-[var(--signal-ink)]"
                    onClick={() => openPath(path.id)}
                  >
                    <ChevronRight size={12} strokeWidth={1.75} />
                  </Button>
                </>
              )}
            </div>
          </div>
        )
      })}

      {deleteConfirm && (
        <ConfirmDialog
          title={t('confirm.deleteHistory')}
          description={t('confirm.deleteHistoryDesc')}
          onConfirm={() => {
            deleteHistoryEntry(deleteConfirm)
            setDeleteConfirm(null)
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
