import { type ReactElement, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MousePointer, Pen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Grid } from '@/components/canvas/Grid'
import { PathLayer } from '@/components/canvas/PathLayer'
import { SimulationLayer } from '@/components/canvas/SimulationLayer'
import { useAppStore } from '@/store/appStore'
import type { WirePath } from '@/domain/types'
import type { CanvasTransform } from '@/hooks/useCanvasTransform'

// ── Mini canvas setup ────────────────────────────────────────────────────────

const MINI_W = 240
const MINI_H = 150
const MINI_T: CanvasTransform = { scale: 20, offsetX: MINI_W / 2, offsetY: MINI_H / 2 }

function makeDemoPath(
  pts: Array<{ id: string; x: number; y: number }>,
  segs: WirePath['segments'] = []
): WirePath {
  return {
    id: 'demo', name: '', createdAt: 0, updatedAt: 0, hasBeenEdited: false,
    points: pts.map(p => ({ ...p, freePlaced: false })),
    segments: segs,
  }
}

const DEMO_SCATTER = makeDemoPath([
  { id: 'p1', x: -3.5, y: -1.5 },
  { id: 'p2', x: 0.5, y: 2 },
  { id: 'p3', x: 3.5, y: -1 },
])

const DEMO_PATH = makeDemoPath(
  [
    { id: 'p1', x: -4, y: -2 },
    { id: 'p2', x: 0, y: -2 },
    { id: 'p3', x: 0, y: 2 },
    { id: 'p4', x: 4, y: 2 },
  ],
  [
    { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'horizontal', isConstrained: true },
    { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'vertical', isConstrained: true },
    { id: 's3', fromPointId: 'p3', toPointId: 'p4', orientation: 'horizontal', isConstrained: true },
  ]
)

function MiniCanvas({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${MINI_W} ${MINI_H}`}
      className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]"
    >
      <Grid transform={MINI_T} gridSizeMm={2} width={MINI_W} height={MINI_H} />
      {children}
    </svg>
  )
}

function DemoPathLayer({ path, selectedPointId = null }: { path: WirePath; selectedPointId?: string | null }) {
  return (
    <PathLayer
      path={path}
      selectedPointId={selectedPointId}
      selectedSegmentId={null}
      transform={MINI_T}
      onPointClick={() => {}}
      onSegmentClick={() => {}}
      onPointDragStart={() => {}}
      onSegmentPointerDown={() => {}}
      onSegmentPointerUp={() => {}}
      onSegmentContextMenu={() => {}}
    />
  )
}

function SimDemo() {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    let id: number
    const DURATION = 4000
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      setProgress(((now - startRef.current) % DURATION) / DURATION)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <MiniCanvas>
      <DemoPathLayer path={DEMO_PATH} />
      <SimulationLayer path={DEMO_PATH} progress={progress} transform={MINI_T} />
    </MiniCanvas>
  )
}

function EditModeDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="h-9 w-9 flex items-center justify-center rounded-[var(--r-md)] bg-[var(--signal-wash)] border border-[var(--signal-line)]">
          <Pen size={15} strokeWidth={1.75} color="var(--signal-ink)" />
        </div>
        <span className="text-[12px] font-semibold text-[var(--signal-ink)]">追加モード</span>
        <span className="text-[11px] text-[var(--ink-3)] text-center max-w-[72px] leading-snug">タップで点を追加</span>
      </div>
      <ChevronRight size={18} strokeWidth={1.5} color="var(--ink-4)" />
      <div className="flex flex-col items-center gap-2">
        <div className="h-9 w-9 flex items-center justify-center rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--line-2)]">
          <MousePointer size={15} strokeWidth={1.75} color="var(--ink-2)" />
        </div>
        <span className="text-[12px] font-semibold text-[var(--ink-2)]">編集モード</span>
        <span className="text-[11px] text-[var(--ink-3)] text-center max-w-[72px] leading-snug">ドラッグで画面移動</span>
      </div>
    </div>
  )
}

// ── Steps ────────────────────────────────────────────────────────────────────

interface HelpStep {
  titleKey: string
  descKey: string
  Demo: () => ReactElement
  mobileOnly?: boolean
}

const ALL_STEPS: HelpStep[] = [
  {
    titleKey: 'help.step1_title',
    descKey: 'help.step1_desc',
    Demo: () => <MiniCanvas><DemoPathLayer path={DEMO_SCATTER} /></MiniCanvas>,
  },
  {
    titleKey: 'help.step2_title',
    descKey: 'help.step2_desc',
    Demo: () => <MiniCanvas><DemoPathLayer path={DEMO_PATH} /></MiniCanvas>,
  },
  {
    titleKey: 'help.step3_title',
    descKey: 'help.step3_desc',
    Demo: () => <MiniCanvas><DemoPathLayer path={DEMO_PATH} selectedPointId="p2" /></MiniCanvas>,
  },
  {
    titleKey: 'help.step4_title',
    descKey: 'help.step4_desc',
    Demo: SimDemo,
  },
  {
    titleKey: 'help.step5_title',
    descKey: 'help.step5_desc',
    mobileOnly: true,
    Demo: EditModeDemo,
  },
]

// ── Modal ────────────────────────────────────────────────────────────────────

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { t } = useTranslation()
  const isMobile = useAppStore(s => s.isMobile)
  const [step, setStep] = useState(0)

  const steps = ALL_STEPS.filter(s => !s.mobileOnly || isMobile)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  const current = steps[Math.min(step, steps.length - 1)]
  const isFirst = step === 0
  const isLast = step === steps.length - 1

  return (
    <Dialog
      open={open}
      onOpenChange={v => !v && onClose()}
      title={t('help.title')}
      className="max-w-[420px]"
    >
      <div className="flex flex-col gap-4">
        {/* Demo */}
        <current.Demo />

        {/* Text */}
        <div className="text-center px-1">
          <p className="text-[14px] font-semibold text-[var(--ink)] mb-1">
            {t(current.titleKey)}
          </p>
          <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
            {t(current.descKey)}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
            className="h-8 w-8 flex items-center justify-center rounded-[var(--r-md)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-5 h-2 bg-[var(--signal)]'
                    : 'w-2 h-2 bg-[var(--line-2)] hover:bg-[var(--ink-3)]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            className="h-8 flex items-center gap-1 px-3 rounded-[var(--r-md)] text-[13px] font-medium bg-[var(--signal-wash)] text-[var(--signal-ink)] hover:opacity-80 transition-opacity"
          >
            {isLast ? t('help.close') : t('help.next')}
            {!isLast && <ChevronRight size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
