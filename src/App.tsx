import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { Canvas } from '@/components/canvas/Canvas'
import { SidePanel } from '@/components/sidebar/SidePanel'
import { MobileDrawer } from '@/components/sidebar/MobileDrawer'
import { SimulationControls } from '@/components/simulation/SimulationControls'
import { CoordEditDialog } from '@/components/dialogs/CoordEditDialog'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { OnboardingDialog } from '@/components/dialogs/OnboardingDialog'
import { Button } from '@/components/ui/Button'
import { TooltipProvider } from '@/components/ui/Tooltip'

const MOBILE_BREAKPOINT = 768

export function App() {
  const { t } = useTranslation()
  const isMobile = useAppStore(s => s.isMobile)
  const setIsMobile = useAppStore(s => s.setIsMobile)
  const theme = useAppStore(s => s.theme)
  const loadHistory = useAppStore(s => s.loadHistory)
  const currentPath = useAppStore(s => s.currentPath)
  const releaseConstraint = useAppStore(s => s.releaseConstraint)
  const deletePoint = useAppStore(s => s.deletePoint)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [longPressPoint, setLongPressPoint] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [releaseConfirm, setReleaseConfirm] = useState<string | null>(null)

  useKeyboard()
  useAutoSave()

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setIsMobile])

  // Restore theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as typeof theme | null
    if (saved) useAppStore.getState().setTheme(saved)
    loadHistory()
  }, [loadHistory])

  const longPressPointData = longPressPoint
    ? currentPath.points.find(p => p.id === longPressPoint)
    : null
  const longPressPointIndex = longPressPoint
    ? currentPath.points.findIndex(p => p.id === longPressPoint)
    : -1

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <Toolbar />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile menu button overlay */}
          {isMobile && (
            <div className="absolute top-3 right-3 z-10">
              <Button
                size="icon"
                variant="secondary"
                className="shadow-[var(--sh-2)]"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={18} strokeWidth={1.75} />
              </Button>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            <Canvas
              onPointLongPress={id => setLongPressPoint(id)}
              onPointClick={() => setLongPressPoint(null)}
            />
            <SimulationControls />
          </div>

          {!isMobile && <SidePanel />}
        </div>

        {isMobile && (
          <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        )}

        {/* Long-press: show edit dialog */}
        {longPressPoint && longPressPointData && (
          <CoordEditDialog
            point={longPressPointData}
            pointIndex={longPressPointIndex}
            onClose={() => setLongPressPoint(null)}
            onDelete={() => {
              setDeleteConfirm(longPressPoint)
              setLongPressPoint(null)
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
            title="拘束を解除しますか？"
            description="このセグメントの拘束を解除します。"
            onConfirm={() => {
              releaseConstraint(releaseConfirm)
              setReleaseConfirm(null)
            }}
            onCancel={() => setReleaseConfirm(null)}
          />
        )}

        <OnboardingDialog />
      </div>
    </TooltipProvider>
  )
}
