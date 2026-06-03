import {
  FilePlus,
  Eraser,
  Undo2,
  Redo2,
  Play,
  Magnet,
  Grid3X3,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { SettingsPopover } from './SettingsPopover'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { useState } from 'react'

// Square-corner ortho icon
function OrthoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" strokeWidth={1.75} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,12 3,4 11,4" />
      <line x1="3" y1="12" x2="11" y2="4" strokeDasharray="2 2" opacity={0.4} />
    </svg>
  )
}

export function Toolbar() {
  const { t } = useTranslation()
  const orthoMode = useAppStore(s => s.orthoMode)
  const snapEnabled = useAppStore(s => s.snapEnabled)
  const gridVisible = useAppStore(s => s.gridVisible)
  const isMobile = useAppStore(s => s.isMobile)
  const undoStack = useAppStore(s => s.undoStack)
  const redoStack = useAppStore(s => s.redoStack)
  const currentPath = useAppStore(s => s.currentPath)
  const simulation = useAppStore(s => s.simulation)

  const setOrthoMode = useAppStore(s => s.setOrthoMode)
  const setSnapEnabled = useAppStore(s => s.setSnapEnabled)
  const setGridVisible = useAppStore(s => s.setGridVisible)
  const undo = useAppStore(s => s.undo)
  const redo = useAppStore(s => s.redo)
  const newPathAction = useAppStore(s => s.newPathAction)
  const clearCurrentPath = useAppStore(s => s.clearCurrentPath)
  const startSimulation = useAppStore(s => s.startSimulation)

  const [clearConfirm, setClearConfirm] = useState(false)

  const canSimulate = currentPath.points.length >= 2 && !simulation.running

  return (
    <header className="flex items-center gap-1 px-3 py-2 border-b border-[var(--line)] bg-[var(--surface)] shadow-[var(--sh-1)] flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2 pr-3 border-r border-[var(--line)]">
        <div className="h-6 w-6 rounded-[4px] grid grid-cols-2 gap-px p-0.5 bg-[var(--ink)]">
          <div className="rounded-sm bg-[var(--signal)]" />
          <div className="rounded-sm bg-[var(--ink-4)]" />
          <div className="rounded-sm bg-[var(--ink-4)]" />
          <div className="rounded-sm bg-[var(--ink-4)]" />
        </div>
        {!isMobile && (
          <span className="text-[13px] font-semibold text-[var(--ink)] hidden sm:block whitespace-nowrap">
            Wire EDM
          </span>
        )}
      </div>

      {/* File actions */}
      <Tooltip content={t('toolbar.newPath')} side="bottom">
        <Button size="icon" variant="ghost" onClick={() => newPathAction()}>
          <FilePlus size={16} strokeWidth={1.75} />
        </Button>
      </Tooltip>
      <Tooltip content={t('toolbar.clear')} side="bottom">
        <Button size="icon" variant="ghost" onClick={() => setClearConfirm(true)}>
          <Eraser size={16} strokeWidth={1.75} />
        </Button>
      </Tooltip>

      <div className="w-px h-5 bg-[var(--line)] mx-1" />

      {/* Undo/redo */}
      <Tooltip content={`${t('toolbar.undo')} (Ctrl+Z)`} side="bottom">
        <Button
          size="icon"
          variant="ghost"
          disabled={undoStack.length === 0}
          onClick={undo}
        >
          <Undo2 size={16} strokeWidth={1.75} />
        </Button>
      </Tooltip>
      <Tooltip content={`${t('toolbar.redo')} (Ctrl+Y)`} side="bottom">
        <Button
          size="icon"
          variant="ghost"
          disabled={redoStack.length === 0}
          onClick={redo}
        >
          <Redo2 size={16} strokeWidth={1.75} />
        </Button>
      </Tooltip>

      <div className="w-px h-5 bg-[var(--line)] mx-1" />

      {/* Mode toggles */}
      <Tooltip content={t('toolbar.orthoMode')} side="bottom">
        <button
          onClick={() => setOrthoMode(!orthoMode)}
          className={`h-8 px-2.5 rounded-[var(--r-md)] flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
            orthoMode
              ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)] border border-[var(--signal-line)]'
              : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <OrthoIcon size={15} />
          {!isMobile && <span>{t('toolbar.orthoMode')}</span>}
        </button>
      </Tooltip>

      {!isMobile && (
        <Tooltip content={t('toolbar.snap')} side="bottom">
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`h-8 px-2.5 rounded-[var(--r-md)] flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
              snapEnabled
                ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)] border border-[var(--signal-line)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Magnet size={15} strokeWidth={1.75} />
            {!isMobile && <span>{t('toolbar.snap')}</span>}
          </button>
        </Tooltip>
      )}

      <Tooltip content={t('toolbar.grid')} side="bottom">
        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={`h-8 px-2.5 rounded-[var(--r-md)] flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
            gridVisible
              ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)] border border-[var(--signal-line)]'
              : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Grid3X3 size={15} strokeWidth={1.75} />
          {!isMobile && <span>{t('toolbar.grid')}</span>}
        </button>
      </Tooltip>

      <div className="flex-1" />

      {/* Simulate */}
      <Tooltip content={canSimulate ? t('toolbar.simulate') : t('simulation.needPoints')} side="bottom">
        <Button
          variant="primary"
          size="sm"
          disabled={!canSimulate}
          onClick={startSimulation}
        >
          <Play size={14} strokeWidth={1.75} />
          {!isMobile && t('toolbar.simulate')}
        </Button>
      </Tooltip>

      <SettingsPopover />

      {clearConfirm && (
        <ConfirmDialog
          title={t('confirm.clearPath')}
          description={t('confirm.clearPathDesc')}
          onConfirm={() => {
            clearCurrentPath()
            setClearConfirm(false)
          }}
          onCancel={() => setClearConfirm(false)}
        />
      )}
    </header>
  )
}
