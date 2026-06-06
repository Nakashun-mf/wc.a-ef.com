import { useState, useEffect, useRef, useMemo, type ReactNode, type ReactElement } from 'react'
import {
  ArrowLeft, Search, X, Menu,
  Pen, MousePointer,
  Undo2, Redo2, FilePlus, History,
  Play, Link, Unlink,
  Sun, Moon, Monitor,
} from 'lucide-react'
import { Grid } from '@/components/canvas/Grid'
import { PathLayer } from '@/components/canvas/PathLayer'
import { SimulationLayer } from '@/components/canvas/SimulationLayer'
import type { WirePath } from '@/domain/types'
import type { CanvasTransform } from '@/hooks/useCanvasTransform'
import { CATEGORIES, ENTRIES, type ManualEntry, type ContentBlock } from './manualContent'

// ── Canvas primitives ─────────────────────────────────────────────────────────

const MINI_W = 280
const MINI_H = 160
const MINI_T: CanvasTransform = { scale: 22, offsetX: MINI_W / 2, offsetY: MINI_H / 2 }

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

const ORTHO_PATH = makeDemoPath(
  [{ id: 'p1', x: -4, y: -2 }, { id: 'p2', x: 0, y: -2 }, { id: 'p3', x: 0, y: 2 }, { id: 'p4', x: 4, y: 2 }],
  [
    { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'horizontal', isConstrained: true },
    { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'vertical', isConstrained: true },
    { id: 's3', fromPointId: 'p3', toPointId: 'p4', orientation: 'horizontal', isConstrained: true },
  ]
)

const FREE_PATH = makeDemoPath(
  [{ id: 'p1', x: -3.5, y: -1.5 }, { id: 'p2', x: 0.5, y: 2 }, { id: 'p3', x: 3.5, y: -1 }],
  [
    { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
    { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
  ]
)

function MiniCanvas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MINI_W} ${MINI_H}`}
      className={`w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] ${className ?? ''}`}
    >
      <Grid transform={MINI_T} gridSizeMm={2} width={MINI_W} height={MINI_H} />
      {children}
    </svg>
  )
}

interface DPLProps {
  path: WirePath
  selectedPointId?: string | null
  selectedSegmentId?: string | null
  showCoords?: boolean
}
function DemoPathLayer({ path, selectedPointId = null, selectedSegmentId = null, showCoords = false }: DPLProps) {
  return (
    <PathLayer
      path={path} selectedPointId={selectedPointId} selectedSegmentId={selectedSegmentId}
      transform={MINI_T} showCoords={showCoords}
      onPointClick={() => {}} onSegmentClick={() => {}}
      onPointDragStart={() => {}} onSegmentPointerDown={() => {}}
      onSegmentPointerUp={() => {}} onSegmentContextMenu={() => {}}
    />
  )
}

// ── Animation hooks ───────────────────────────────────────────────────────────

function useLoopT(duration: number): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf: number
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now
      setT(((now - start) % duration) / duration)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration])
  return t
}

function usePingPong(duration: number): number {
  const t = useLoopT(duration)
  return t < 0.5 ? t * 2 : (1 - t) * 2
}

function useStepLoop(steps: number, msPerStep: number): number {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps), msPerStep)
    return () => clearInterval(id)
  }, [steps, msPerStep])
  return step
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// ── Demo label overlay ────────────────────────────────────────────────────────

function DemoLabel({ children }: { children: ReactNode }) {
  return (
    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--surface)] border border-[var(--line)] text-[var(--ink-3)]">
      {children}
    </span>
  )
}

// ── Static demos ──────────────────────────────────────────────────────────────

function AboutDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-[6px] grid grid-cols-2 gap-0.5 p-1 bg-[var(--ink)]">
        <div className="rounded-sm bg-[var(--signal)]" />
        <div className="rounded-sm bg-[var(--ink-4)]" />
        <div className="rounded-sm bg-[var(--ink-4)]" />
        <div className="rounded-sm bg-[var(--ink-4)]" />
      </div>
      <p className="text-[13px] font-semibold text-[var(--ink)]">Wire EDM</p>
      <div className="flex gap-4 text-[var(--ink-3)]">
        {[
          { icon: <Pen size={16} strokeWidth={1.75} />, label: '点を追加' },
          { icon: <Play size={16} strokeWidth={1.75} />, label: 'シミュレーション' },
          { icon: <History size={16} strokeWidth={1.75} />, label: '履歴管理' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 flex items-center justify-center rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)]">{icon}</div>
            <span className="text-[10px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenLayoutDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden text-[10px] font-mono text-[var(--ink-3)]">
      <div className="px-3 py-2 bg-[var(--surface)] border-b border-[var(--line)] flex items-center gap-2">
        <span className="text-[var(--signal-ink)] font-semibold">ツールバー</span>
        <div className="flex-1" />
        <span>▶</span><span>⚙</span>
      </div>
      <div className="flex" style={{ minHeight: 80 }}>
        <div className="flex-1 flex items-center justify-center border-r border-[var(--line)] text-[var(--ink-4)]">
          キャンバス<br />（メインエリア）
        </div>
        <div className="w-20 flex flex-col divide-y divide-[var(--line)]">
          <div className="flex-1 flex items-center justify-center p-1 text-center leading-tight">座標<br />リスト</div>
          <div className="flex-1 flex items-center justify-center p-1 text-center leading-tight">履歴</div>
        </div>
      </div>
    </div>
  )
}

function CoordSystemDemo() {
  return (
    <svg viewBox="0 0 200 120" className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
      <line x1="40" y1="90" x2="170" y2="90" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="170,87 176,90 170,93" fill="var(--ink-3)" />
      <line x1="40" y1="90" x2="40" y2="20" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="37,20 40,14 43,20" fill="var(--ink-3)" />
      <circle cx="40" cy="90" r="3" fill="var(--ink-3)" />
      <text x="180" y="94" fontSize="12" fontFamily="var(--font-mono)" fill="var(--ink-2)" textAnchor="middle">X</text>
      <text x="40" y="10" fontSize="12" fontFamily="var(--font-mono)" fill="var(--ink-2)" textAnchor="middle">Y</text>
      <text x="100" y="108" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)" textAnchor="middle">右 → プラス (+)</text>
      <text x="10" y="55" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)" textAnchor="middle" transform="rotate(-90 10 55)">上 → プラス (+)</text>
      <text x="42" y="100" fontSize="8" fontFamily="var(--font-mono)" fill="var(--ink-4)">原点 (0,0)</text>
    </svg>
  )
}

function PointLabelDemo() {
  return (
    <MiniCanvas>
      <DemoPathLayer path={FREE_PATH} />
    </MiniCanvas>
  )
}

function HorizontalLineDemo() {
  const path = makeDemoPath(
    [{ id: 'p1', x: -4, y: 0 }, { id: 'p2', x: 4, y: 0 }],
    [{ id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'horizontal', isConstrained: true }]
  )
  return (
    <MiniCanvas>
      <DemoPathLayer path={path} />
      <text x={MINI_W / 2} y={MINI_H - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--info)" textAnchor="middle" style={{ userSelect: 'none', pointerEvents: 'none' }}>水平拘束（青）</text>
    </MiniCanvas>
  )
}

function VerticalLineDemo() {
  const path = makeDemoPath(
    [{ id: 'p1', x: 0, y: -3 }, { id: 'p2', x: 0, y: 3 }],
    [{ id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'vertical', isConstrained: true }]
  )
  return (
    <MiniCanvas>
      <DemoPathLayer path={path} />
      <text x={MINI_W / 2} y={MINI_H - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--signal)" textAnchor="middle" style={{ userSelect: 'none', pointerEvents: 'none' }}>垂直拘束（緑）</text>
    </MiniCanvas>
  )
}

function ConstraintMarkDemo() {
  return (
    <MiniCanvas>
      <DemoPathLayer path={ORTHO_PATH} />
    </MiniCanvas>
  )
}

function FreeSegmentDemo() {
  const path = makeDemoPath(
    ORTHO_PATH.points,
    ORTHO_PATH.segments.map(s => ({ ...s, isConstrained: false, orientation: 'free' as const }))
  )
  return (
    <MiniCanvas>
      <DemoPathLayer path={path} />
    </MiniCanvas>
  )
}

function CoordDialogDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 flex items-center justify-center">
      <div className="rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] p-4 w-48 space-y-3">
        <p className="text-[12px] font-semibold text-[var(--ink)]">P2 の座標を編集</p>
        {(['X', 'Y'] as const).map((axis, i) => (
          <label key={axis} className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">{axis} mm</span>
            <div className="mt-0.5 px-2 py-1.5 text-[12px] font-mono bg-[var(--paper)] border border-[var(--line-2)] rounded-[var(--r-sm)] text-[var(--ink)]">
              {i === 0 ? '0.00' : '-2.00'}
            </div>
          </label>
        ))}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-1.5 text-center text-[11px] rounded-[var(--r-md)] bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] font-medium">確定</div>
          <div className="flex-1 py-1.5 text-center text-[11px] rounded-[var(--r-md)] border border-[var(--line)] text-[var(--ink-3)]">キャンセル</div>
        </div>
        <div className="pt-1 text-center text-[11px] text-[var(--danger)]">この点を削除</div>
      </div>
    </div>
  )
}

function ContextMenuDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-8">
      <MiniCanvas className="!w-32">
        <DemoPathLayer path={ORTHO_PATH} selectedSegmentId="s1" />
      </MiniCanvas>
      <div className="rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] overflow-hidden min-w-[100px]">
        <div className="px-3 py-2 text-[12px] text-[var(--ink-2)] flex items-center gap-2 hover:bg-[var(--surface-2)]">
          <Unlink size={12} strokeWidth={1.75} />
          拘束を解除
        </div>
      </div>
    </div>
  )
}

function UndoLimitDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {[
          { icon: <Undo2 size={18} strokeWidth={1.75} />, label: 'Ctrl+Z', color: 'var(--signal-ink)' },
          { icon: <Redo2 size={18} strokeWidth={1.75} />, label: 'Ctrl+Y', color: 'var(--ink-3)' },
        ].map(({ icon, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="h-10 w-10 flex items-center justify-center rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)]" style={{ color }}>
              {icon}
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-3)]">{label}</span>
          </div>
        ))}
      </div>
      <div className="w-full">
        <div className="flex justify-between text-[10px] font-mono text-[var(--ink-3)] mb-1">
          <span>Undoスタック</span><span>最大 50 ステップ</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <div className="h-full bg-[var(--signal)] rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

function SimRequirementsDemo() {
  const twoPath = makeDemoPath(
    [{ id: 'p1', x: -3, y: 0 }, { id: 'p2', x: 3, y: 0 }],
    [{ id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false }]
  )
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden">
      <MiniCanvas>
        <DemoPathLayer path={twoPath} />
      </MiniCanvas>
      <div className="px-3 py-2 bg-[var(--surface)] border-t border-[var(--line)] flex items-center gap-2">
        <span className="text-[11px] text-[var(--ink-3)]">2点以上あればシミュレーション開始可</span>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-md)] bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] text-[11px] font-medium">
          <Play size={11} strokeWidth={1.75} />▶
        </div>
      </div>
    </div>
  )
}

function SimSpeedDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[var(--ink-3)]">速度</span>
        <span className="text-[11px] font-mono text-[var(--ink-2)]">10 mm/秒</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--line)]">
        <div className="absolute left-0 top-0 h-full w-2/5 rounded-full bg-[var(--signal)]" />
        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[var(--surface)] border-2 border-[var(--signal)] shadow-sm" style={{ left: 'calc(40% - 8px)' }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-[var(--ink-4)]">低速</span>
        <span className="text-[9px] font-mono text-[var(--ink-4)]">高速</span>
      </div>
    </div>
  )
}

function RenamePathDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 space-y-2">
      <p className="text-[11px] font-mono text-[var(--ink-3)]">名前を変更</p>
      <div className="flex gap-2">
        <div className="flex-1 px-2 py-1.5 text-[12px] font-mono bg-[var(--surface)] border border-[var(--signal)] rounded-[var(--r-sm)] text-[var(--ink)]">
          2025-06-01 加工経路A
        </div>
      </div>
      <p className="text-[10px] text-[var(--ink-4)]">Enter で確定、Esc でキャンセル</p>
    </div>
  )
}

function DeletePathDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden">
      {['加工経路A', '加工経路B', '加工経路C'].map((name, i) => (
        <div key={name} className={`flex items-center px-3 py-2 border-b border-[var(--line)] last:border-b-0 ${i === 1 ? 'bg-[var(--danger-wash)]' : ''}`}>
          <span className={`text-[12px] flex-1 ${i === 1 ? 'text-[var(--danger)]' : 'text-[var(--ink-2)]'}`}>{name}</span>
          {i === 1 && <span className="text-[10px] font-semibold text-[var(--danger)] border border-[var(--danger)] rounded px-1.5 py-0.5">削除</span>}
        </div>
      ))}
    </div>
  )
}

function AutoSaveDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-8 flex flex-col items-center gap-3">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[var(--signal-wash)] border border-[var(--signal-line)]">
        <FilePlus size={22} strokeWidth={1.75} color="var(--signal-ink)" />
      </div>
      <p className="text-[12px] font-semibold text-[var(--ink)]">自動保存済み</p>
      <p className="text-[10px] font-mono text-[var(--ink-4)]">最終保存：14:35</p>
    </div>
  )
}

function ThemeDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-3 flex gap-2 justify-center">
      {[
        { icon: <Monitor size={14} strokeWidth={1.75} />, label: 'システム' },
        { icon: <Sun size={14} strokeWidth={1.75} />, label: 'ライト' },
        { icon: <Moon size={14} strokeWidth={1.75} />, label: 'ダーク' },
      ].map(({ icon, label }, i) => (
        <div key={label} className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-[var(--r-md)] border text-[11px] ${
          i === 0
            ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]'
            : 'bg-transparent border-[var(--line)] text-[var(--ink-2)]'
        }`}>
          {icon}
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function LanguageDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 flex gap-3 justify-center">
      {(['日本語', 'English'] as const).map((lang, i) => (
        <div key={lang} className={`flex-1 py-2 text-center rounded-[var(--r-md)] text-[13px] font-medium border ${
          i === 0
            ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]'
            : 'bg-transparent border-[var(--line)] text-[var(--ink-2)]'
        }`}>
          {lang}
        </div>
      ))}
    </div>
  )
}

// ── Animated demos ────────────────────────────────────────────────────────────

function AddModeDemo() {
  const step = useStepLoop(4, 900)
  const isAdd = step <= 1
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-8">
      {[
        { icon: <Pen size={16} strokeWidth={1.75} />, label: '追加モード', active: isAdd },
        { icon: <MousePointer size={16} strokeWidth={1.75} />, label: '編集モード', active: !isAdd },
      ].map(({ icon, label, active }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className={`h-10 w-10 flex items-center justify-center rounded-[var(--r-md)] border transition-colors ${active ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]' : 'bg-transparent border-[var(--line)] text-[var(--ink-3)]'}`}>
            {icon}
          </div>
          <span className={`text-[11px] font-medium ${active ? 'text-[var(--signal-ink)]' : 'text-[var(--ink-3)]'}`}>{label}</span>
        </div>
      ))}
    </div>
  )
}

function AddPointDemo() {
  const step = useStepLoop(5, 700)
  const count = step === 0 ? 0 : Math.min(step, 3)
  const PTS = [
    { id: 'p1', x: -3.5, y: -1.5 },
    { id: 'p2', x: 0.5, y: 2 },
    { id: 'p3', x: 3.5, y: -1 },
  ]
  const SEGS: WirePath['segments'] = [
    { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
    { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
  ]
  const path = makeDemoPath(PTS.slice(0, count), SEGS.slice(0, Math.max(0, count - 1)))
  return (
    <div className="relative">
      <MiniCanvas>{count > 0 && <DemoPathLayer path={path} />}</MiniCanvas>
      <DemoLabel>P{count > 0 ? count : '?'} / 3点</DemoLabel>
    </div>
  )
}

function SnapToGridDemo() {
  const step = useStepLoop(6, 500)
  const snapProgress = step <= 1 ? 0 : step <= 3 ? (step - 1) / 2 : 1
  const ease = easeInOut(snapProgress)
  const x = 0.7 - ease * 0.7
  const y = 0.7 - ease * 0.7
  const path = makeDemoPath(
    [{ id: 'p1', x: -3, y: -1 }, { id: 'p2', x, y }, { id: 'p3', x: 3, y: -1 }],
    [
      { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
      { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
    ]
  )
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId="p2" /></MiniCanvas>
      <DemoLabel>{snapProgress < 1 ? `自由位置 (${(x).toFixed(1)}, ${(y).toFixed(1)})` : 'スナップ済 (0.0, 0.0)'}</DemoLabel>
    </div>
  )
}

function OrthoOnDemo() {
  const step = useStepLoop(4, 1200)
  const isOrtho = step >= 2
  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={isOrtho ? ORTHO_PATH : FREE_PATH} />
      </MiniCanvas>
      <DemoLabel>{isOrtho ? '直交モード ON' : '直交モード OFF'}</DemoLabel>
    </div>
  )
}

function SelectPointDemo() {
  const step = useStepLoop(4, 900)
  const selectedId = step === 0 ? null : step === 1 ? 'p1' : step === 2 ? 'p2' : 'p3'
  return (
    <MiniCanvas><DemoPathLayer path={ORTHO_PATH} selectedPointId={selectedId} /></MiniCanvas>
  )
}

function DragPointDemo() {
  const t = usePingPong(2800)
  const ease = easeInOut(t)
  const p2x = 0 + ease * 2.5
  const p2y = -2 + ease * 2
  const path = makeDemoPath(
    [{ id: 'p1', x: -4, y: -2 }, { id: 'p2', x: p2x, y: p2y }, { id: 'p3', x: 4, y: 2 }],
    [
      { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
      { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
    ]
  )
  return <MiniCanvas><DemoPathLayer path={path} selectedPointId="p2" /></MiniCanvas>
}

function DeselectPointDemo() {
  const step = useStepLoop(4, 900)
  const selectedId = step <= 1 ? 'p2' : null
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} selectedPointId={selectedId} /></MiniCanvas>
      <DemoLabel>{selectedId ? '選択中' : '選択解除'}</DemoLabel>
    </div>
  )
}

function LongPressDemo() {
  const step = useStepLoop(5, 600)
  const isPulsing = step === 2 || step === 3
  const showDialog = step >= 3
  const cx = MINI_T.offsetX + 0 * MINI_T.scale
  const cy = MINI_T.offsetY - (-2) * MINI_T.scale
  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={ORTHO_PATH} selectedPointId="p2" />
        {isPulsing && (
          <circle cx={cx} cy={cy} r={14} fill="none" stroke="var(--signal)" strokeWidth={1.5} opacity={0.5} />
        )}
      </MiniCanvas>
      {showDialog && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] px-3 py-2 text-[11px] text-[var(--ink-2)]">
            座標入力ダイアログ
          </div>
        </div>
      )}
    </div>
  )
}

function DeletePointDemo() {
  const step = useStepLoop(5, 800)
  const hasMid = step <= 2
  const isMidSelected = step === 2
  const path = hasMid
    ? makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p2', x: 0, y: 0 }, { id: 'p3', x: 4, y: -2 }],
        [
          { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
          { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
        ]
      )
    : makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p3', x: 4, y: -2 }],
        [{ id: 's1', fromPointId: 'p1', toPointId: 'p3', orientation: 'free', isConstrained: false }]
      )
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId={isMidSelected ? 'p2' : null} /></MiniCanvas>
      <DemoLabel>{hasMid ? '3点' : '削除後 → 2点'}</DemoLabel>
    </div>
  )
}

function SelectSegmentDemo() {
  const step = useStepLoop(4, 1000)
  const segId = step === 0 ? null : step === 1 ? 's1' : step === 2 ? 's2' : 's3'
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} selectedSegmentId={segId} /></MiniCanvas>
      <DemoLabel>{segId ? `${segId} 選択中` : '未選択'}</DemoLabel>
    </div>
  )
}

function ReleaseConstraintDemo() {
  const step = useStepLoop(4, 1100)
  const isConstrained = step <= 1
  const path = isConstrained
    ? ORTHO_PATH
    : makeDemoPath(ORTHO_PATH.points, ORTHO_PATH.segments.map(s => ({ ...s, isConstrained: false, orientation: 'free' as const })))
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{isConstrained ? '拘束あり' : '拘束解除済'}</DemoLabel>
    </div>
  )
}

function EditModeDemo() {
  const step = useStepLoop(4, 1000)
  const isEdit = step >= 2
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-6">
      {[
        { icon: <Pen size={16} strokeWidth={1.75} />, label: '追加モード', desc: 'タップで追加', active: !isEdit },
        { icon: <MousePointer size={16} strokeWidth={1.75} />, label: '編集モード', desc: 'ドラッグでパン', active: isEdit },
      ].map(({ icon, label, desc, active }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <div className={`h-10 w-10 flex items-center justify-center rounded-[var(--r-md)] border ${active ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]' : 'bg-transparent border-[var(--line)] text-[var(--ink-3)]'}`}>
            {icon}
          </div>
          <span className={`text-[11px] font-semibold ${active ? 'text-[var(--signal-ink)]' : 'text-[var(--ink-3)]'}`}>{label}</span>
          <span className="text-[10px] text-[var(--ink-4)] text-center">{desc}</span>
        </div>
      ))}
    </div>
  )
}

function PanCanvasDemo() {
  const t = usePingPong(3000)
  const ease = easeInOut(t)
  const transform: CanvasTransform = { scale: 22, offsetX: MINI_W / 2 - ease * 50, offsetY: MINI_H / 2 }
  return (
    <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
      <Grid transform={transform} gridSizeMm={2} width={MINI_W} height={MINI_H} />
      <PathLayer path={ORTHO_PATH} selectedPointId={null} selectedSegmentId={null} transform={transform}
        onPointClick={() => {}} onSegmentClick={() => {}} onPointDragStart={() => {}}
        onSegmentPointerDown={() => {}} onSegmentPointerUp={() => {}} onSegmentContextMenu={() => {}} />
    </svg>
  )
}

function ZoomDemo() {
  const t = usePingPong(3000)
  const ease = easeInOut(t)
  const scale = 14 + ease * 18
  const transform: CanvasTransform = { scale, offsetX: MINI_W / 2, offsetY: MINI_H / 2 }
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
        <Grid transform={transform} gridSizeMm={2} width={MINI_W} height={MINI_H} />
        <PathLayer path={ORTHO_PATH} selectedPointId={null} selectedSegmentId={null} transform={transform}
          onPointClick={() => {}} onSegmentClick={() => {}} onPointDragStart={() => {}}
          onSegmentPointerDown={() => {}} onSegmentPointerUp={() => {}} onSegmentContextMenu={() => {}} />
      </svg>
      <DemoLabel>{scale.toFixed(0)}px/mm</DemoLabel>
    </div>
  )
}

function SnapToggleDemo() {
  const step = useStepLoop(4, 1000)
  const snapOn = step <= 1
  const x = snapOn ? 1 : 0.6
  const y = snapOn ? 1 : 0.7
  const path = makeDemoPath(
    [{ id: 'p1', x: -3, y: -1.5 }, { id: 'p2', x, y }, { id: 'p3', x: 3, y: -1.5 }],
    [
      { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
      { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
    ]
  )
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId="p2" /></MiniCanvas>
      <DemoLabel>スナップ {snapOn ? 'ON（グリッドに吸着）' : 'OFF（任意位置）'}</DemoLabel>
    </div>
  )
}

function GridToggleDemo() {
  const step = useStepLoop(4, 1000)
  const showGrid = step <= 1
  const transform: CanvasTransform = { scale: 22, offsetX: MINI_W / 2, offsetY: MINI_H / 2 }
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
        {showGrid && <Grid transform={transform} gridSizeMm={2} width={MINI_W} height={MINI_H} />}
        <PathLayer path={ORTHO_PATH} selectedPointId={null} selectedSegmentId={null} transform={transform}
          onPointClick={() => {}} onSegmentClick={() => {}} onPointDragStart={() => {}}
          onSegmentPointerDown={() => {}} onSegmentPointerUp={() => {}} onSegmentContextMenu={() => {}} />
      </svg>
      <DemoLabel>グリッド {showGrid ? 'ON' : 'OFF'}</DemoLabel>
    </div>
  )
}

function ListOverviewDemo() {
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden text-[12px]">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--surface)] border-b border-[var(--line)]">
            <th className="text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-3)]">#</th>
            <th className="text-right px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-3)]">X (mm)</th>
            <th className="text-right px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-3)]">Y (mm)</th>
          </tr>
        </thead>
        <tbody>
          {[
            { p: 'P1', x: '-4.00', y: '-2.00', chain: false },
            { p: 'P2', x: '0.00',  y: '-2.00', chain: true  },
            { p: 'P3', x: '0.00',  y: '2.00',  chain: true  },
            { p: 'P4', x: '4.00',  y: '2.00',  chain: false },
          ].map(({ p, x, y, chain }) => (
            <tr key={p} className="border-b border-[var(--line)] last:border-b-0">
              <td className="px-3 py-1.5">
                <span className="font-mono font-medium text-[var(--ink-2)]">{p}</span>
                {chain && <Link size={10} className="inline ml-1 text-[var(--signal-ink)]" strokeWidth={1.75} />}
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-[var(--ink)]">{x}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[var(--ink)]">{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListSelectDemo() {
  const step = useStepLoop(5, 800)
  const selIdx = step === 0 ? -1 : (step - 1) % 4
  const rows = [
    { p: 'P1', x: '-4.00', y: '-2.00' },
    { p: 'P2', x: '0.00',  y: '-2.00' },
    { p: 'P3', x: '0.00',  y: '2.00'  },
    { p: 'P4', x: '4.00',  y: '2.00'  },
  ]
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden text-[12px]">
      {rows.map(({ p, x, y }, i) => (
        <div key={p} className={`flex items-center px-3 py-1.5 border-b border-[var(--line)] last:border-b-0 transition-colors ${i === selIdx ? 'bg-[var(--signal-wash)]' : ''}`}>
          <span className={`font-mono font-medium flex-shrink-0 w-8 ${i === selIdx ? 'text-[var(--signal-ink)]' : 'text-[var(--ink-2)]'}`}>{p}</span>
          <span className="flex-1 text-right font-mono text-[var(--ink)] text-[11px]">{x}</span>
          <span className="w-2" />
          <span className="flex-1 text-right font-mono text-[var(--ink)] text-[11px]">{y}</span>
        </div>
      ))}
    </div>
  )
}

function ListInlineEditDemo() {
  const step = useStepLoop(4, 900)
  const values = ['0.00', '1.00', '2.50', '0.00']
  const val = values[step]
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono font-semibold text-[var(--signal-ink)] text-[12px]">P2 を編集</span>
      </div>
      <div className="flex gap-2">
        {(['X', 'Y'] as const).map((axis, i) => (
          <label key={axis} className="flex-1">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--ink-3)] mb-1">{axis} mm</span>
            <div className={`px-2 py-1.5 text-[12px] font-mono rounded-[var(--r-sm)] border ${i === 0 ? 'bg-[var(--surface)] border-[var(--signal)] ring-1 ring-[var(--signal)] text-[var(--ink)]' : 'bg-[var(--surface)] border-[var(--line-2)] text-[var(--ink)]'}`}>
              {i === 0 ? val : '-2.00'}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function ListReleaseConstraintDemo() {
  const step = useStepLoop(4, 900)
  const isConstrained = step <= 1
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono font-semibold text-[var(--signal-ink)] text-[12px] flex items-center gap-1">
          P2 {isConstrained && <Link size={11} className="text-[var(--signal-ink)]" strokeWidth={1.75} />}
        </span>
        {isConstrained && (
          <button className="h-6 w-6 flex items-center justify-center rounded-[var(--r-md)] bg-[var(--warn-wash)] border border-[var(--warn)]">
            <Unlink size={12} color="var(--warn)" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div className={`text-[11px] font-mono ${isConstrained ? 'text-[var(--ink-3)]' : 'text-[var(--signal-ink)]'}`}>
        {isConstrained ? '拘束あり → Unlinkボタンで解除' : '✓ 拘束解除済み'}
      </div>
    </div>
  )
}

function ShowCoordsDemo() {
  const step = useStepLoop(4, 1000)
  const showCoords = step >= 2
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} showCoords={showCoords} /></MiniCanvas>
      <DemoLabel>座標表示 {showCoords ? 'ON' : 'OFF'}</DemoLabel>
    </div>
  )
}

function UndoDemo() {
  const step = useStepLoop(5, 700)
  const hasMid = step <= 1 || step === 4
  const path = hasMid
    ? makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p2', x: 0, y: 0 }, { id: 'p3', x: 4, y: -2 }],
        [
          { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
          { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
        ]
      )
    : makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p3', x: 4, y: -2 }],
        [{ id: 's1', fromPointId: 'p1', toPointId: 'p3', orientation: 'free', isConstrained: false }]
      )
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{hasMid ? '操作前（3点）' : 'Undo → 2点'}</DemoLabel>
    </div>
  )
}

function RedoDemo() {
  const step = useStepLoop(5, 700)
  const hasMid = step >= 2 && step <= 4
  const path = hasMid
    ? makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p2', x: 0, y: 0 }, { id: 'p3', x: 4, y: -2 }],
        [
          { id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'free', isConstrained: false },
          { id: 's2', fromPointId: 'p2', toPointId: 'p3', orientation: 'free', isConstrained: false },
        ]
      )
    : makeDemoPath(
        [{ id: 'p1', x: -4, y: -2 }, { id: 'p3', x: 4, y: -2 }],
        [{ id: 's1', fromPointId: 'p1', toPointId: 'p3', orientation: 'free', isConstrained: false }]
      )
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{hasMid ? 'Redo → 3点に戻る' : 'Undo後（2点）'}</DemoLabel>
    </div>
  )
}

function SimLoopDemo({ endBehavior }: { endBehavior?: 'pause' | 'restart' | 'skip' | 'stop' }) {
  const t = useLoopT(4000)
  let progress: number
  let label = ''

  if (!endBehavior) {
    progress = t
    label = `${(t * 100).toFixed(0)}%`
  } else if (endBehavior === 'pause') {
    progress = t < 0.45 ? t / 0.45 * 0.5 : t < 0.7 ? 0.5 : 0
    label = t >= 0.45 && t < 0.7 ? '一時停止中' : `${(progress * 100).toFixed(0)}%`
  } else if (endBehavior === 'restart') {
    progress = t < 0.5 ? t * 0.9 : t < 0.55 ? 0 : (t - 0.55) * 0.9
    label = t >= 0.5 && t < 0.55 ? '← 最初から再生' : `${(progress * 100).toFixed(0)}%`
  } else if (endBehavior === 'skip') {
    progress = t < 0.4 ? t / 0.4 * 0.35 : t < 0.45 ? 1 : t < 0.7 ? 1 : 0
    label = t >= 0.4 && t < 0.45 ? '→ スキップ' : `${(progress * 100).toFixed(0)}%`
  } else {
    // stop
    progress = t < 0.5 ? t * 0.9 : 0
    label = t >= 0.5 ? '停止済み' : `${(progress * 100).toFixed(0)}%`
  }

  const showHead = !(endBehavior === 'stop' && t >= 0.5)

  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={ORTHO_PATH} />
        {showHead && <SimulationLayer path={ORTHO_PATH} progress={progress} transform={MINI_T} />}
      </MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function SimResumeDemo() {
  const t = useLoopT(4000)
  const paused = t < 0.35
  const progress = paused ? 0.35 : 0.35 + (t - 0.35) / 0.65 * 0.65
  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={ORTHO_PATH} />
        <SimulationLayer path={ORTHO_PATH} progress={progress} transform={MINI_T} />
      </MiniCanvas>
      <DemoLabel>{paused ? '一時停止中 → 再開待ち' : `再開 ${(progress * 100).toFixed(0)}%`}</DemoLabel>
    </div>
  )
}

function NewPathDemo() {
  const step = useStepLoop(5, 700)
  const hasPath = step <= 2
  return (
    <div className="relative">
      <MiniCanvas>
        {hasPath && <DemoPathLayer path={ORTHO_PATH} />}
      </MiniCanvas>
      <DemoLabel>{hasPath ? '現在の経路' : '新規作成後（空）'}</DemoLabel>
    </div>
  )
}

function OpenPathDemo() {
  const step = useStepLoop(5, 800)
  const showPath = step >= 3
  const selIdx = step === 1 || step === 2 ? 1 : -1
  const routes = ['2025-06-01  経路A', '2025-06-03  経路B', '2025-06-05  経路C']
  return (
    <div className="relative w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden">
      {!showPath ? (
        <div className="flex flex-col divide-y divide-[var(--line)]">
          {routes.map((r, i) => (
            <div key={r} className={`px-3 py-2 flex items-center gap-2 text-[12px] transition-colors ${i === selIdx ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)]' : 'text-[var(--ink-2)]'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
              {r}
              {i === selIdx && <span className="ml-auto text-[10px] border border-[var(--signal)] rounded px-1.5 py-0.5">開く</span>}
            </div>
          ))}
        </div>
      ) : (
        <MiniCanvas><DemoPathLayer path={ORTHO_PATH} /></MiniCanvas>
      )}
      <div className="absolute bottom-2 right-2">
        <DemoLabel>{showPath ? '経路を読み込み済み' : '履歴から選択中'}</DemoLabel>
      </div>
    </div>
  )
}

function ClearPathDemo() {
  const step = useStepLoop(5, 700)
  const hasPath = step <= 2
  return (
    <div className="relative">
      <MiniCanvas>
        {hasPath && <DemoPathLayer path={FREE_PATH} />}
      </MiniCanvas>
      <DemoLabel>{hasPath ? 'クリア前' : 'クリア後（空）'}</DemoLabel>
    </div>
  )
}

function ShowCoordsSettingDemo() {
  const step = useStepLoop(4, 1000)
  const showCoords = step >= 2
  return (
    <div className="relative space-y-1">
      <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] px-3 py-2 flex items-center justify-between">
        <span className="text-[12px] text-[var(--ink-2)]">点の座標を表示</span>
        <div className={`h-5 w-9 rounded-full transition-colors flex items-center px-0.5 ${showCoords ? 'bg-[var(--signal)] justify-end' : 'bg-[var(--line-2)] justify-start'}`}>
          <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
        </div>
      </div>
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} showCoords={showCoords} /></MiniCanvas>
    </div>
  )
}

// ── Demo map ──────────────────────────────────────────────────────────────────

const DEMO_MAP: Record<string, () => ReactElement> = {
  'about':                    AboutDemo,
  'screen-layout':            ScreenLayoutDemo,
  'coordinate-system':        CoordSystemDemo,
  'add-mode':                 AddModeDemo,
  'add-point':                AddPointDemo,
  'point-label':              PointLabelDemo,
  'snap-to-grid':             SnapToGridDemo,
  'ortho-on':                 OrthoOnDemo,
  'horizontal-line':          HorizontalLineDemo,
  'vertical-line':            VerticalLineDemo,
  'constraint-mark':          ConstraintMarkDemo,
  'free-segment':             FreeSegmentDemo,
  'select-point':             SelectPointDemo,
  'drag-point':               DragPointDemo,
  'deselect-point':           DeselectPointDemo,
  'longpress-point':          LongPressDemo,
  'coord-dialog':             CoordDialogDemo,
  'delete-point':             DeletePointDemo,
  'select-segment':           SelectSegmentDemo,
  'release-constraint-canvas': ReleaseConstraintDemo,
  'segment-context-menu':     ContextMenuDemo,
  'edit-mode':                EditModeDemo,
  'pan-canvas':               PanCanvasDemo,
  'pinch-zoom':               ZoomDemo,
  'snap-toggle':              SnapToggleDemo,
  'grid-toggle':              GridToggleDemo,
  'list-overview':            ListOverviewDemo,
  'list-select':              ListSelectDemo,
  'list-inline-edit':         ListInlineEditDemo,
  'list-release-constraint':  ListReleaseConstraintDemo,
  'show-coords-option':       ShowCoordsDemo,
  'undo':                     UndoDemo,
  'redo':                     RedoDemo,
  'undo-limit':               UndoLimitDemo,
  'sim-requirements':         SimRequirementsDemo,
  'sim-start':                () => <SimLoopDemo />,
  'sim-speed':                SimSpeedDemo,
  'sim-pause':                () => <SimLoopDemo endBehavior="pause" />,
  'sim-resume':               SimResumeDemo,
  'sim-restart':              () => <SimLoopDemo endBehavior="restart" />,
  'sim-skip':                 () => <SimLoopDemo endBehavior="skip" />,
  'sim-stop':                 () => <SimLoopDemo endBehavior="stop" />,
  'sim-trail':                () => <SimLoopDemo />,
  'new-path':                 NewPathDemo,
  'open-path':                OpenPathDemo,
  'rename-path':              RenamePathDemo,
  'delete-path':              DeletePathDemo,
  'clear-path':               ClearPathDemo,
  'autosave':                 AutoSaveDemo,
  'theme':                    ThemeDemo,
  'language':                 LanguageDemo,
  'show-coords-setting':      ShowCoordsSettingDemo,
}

// ── Content block renderer ────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === 'p') {
    return <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{block.text}</p>
  }
  if (block.type === 'steps') {
    return (
      <ol className="space-y-1.5 pl-0">
        {block.items?.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] text-[var(--ink-2)] leading-relaxed">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] text-[10px] font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    )
  }
  if (block.type === 'tip') {
    return (
      <div className="flex gap-2.5 p-3 rounded-[var(--r-md)] bg-[var(--info-wash)] border border-[var(--info)] border-opacity-40">
        <span className="text-[12px] text-[var(--info)] flex-shrink-0 mt-0.5">💡</span>
        <p className="text-[12px] text-[var(--ink-2)] leading-relaxed">{block.text}</p>
      </div>
    )
  }
  if (block.type === 'warn') {
    return (
      <div className="flex gap-2.5 p-3 rounded-[var(--r-md)] bg-[var(--warn-wash)] border border-[var(--warn)] border-opacity-40">
        <span className="text-[12px] text-[var(--warn)] flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-[12px] text-[var(--ink-2)] leading-relaxed">{block.text}</p>
      </div>
    )
  }
  return null
}

// ── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({ entry, lang, showCategory = false }: { entry: ManualEntry; lang: 'ja' | 'en'; showCategory?: boolean }) {
  const Demo = DEMO_MAP[entry.id]
  const title = lang === 'ja' ? entry.titleJa : entry.titleEn
  const body = lang === 'ja' ? entry.bodyJa : entry.bodyEn
  const cat = CATEGORIES.find(c => c.id === entry.category)

  return (
    <div id={`entry-${entry.id}`} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
      {Demo && (
        <div className="p-3 bg-[var(--paper)] border-b border-[var(--line)]">
          <Demo />
        </div>
      )}
      <div className="p-4 space-y-3">
        {showCategory && cat && (
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--signal-wash)] text-[var(--signal-ink)] border border-[var(--signal-line)]">
            {lang === 'ja' ? cat.labelJa : cat.labelEn}
          </span>
        )}
        <h3 className="text-[15px] font-semibold text-[var(--ink)] leading-snug">{title}</h3>
        <div className="space-y-2.5">
          {body.map((block, i) => <BlockRenderer key={i} block={block} />)}
        </div>
      </div>
    </div>
  )
}

// ── Manual page ───────────────────────────────────────────────────────────────

export function ManualPage() {
  const [lang, setLang] = useState<'ja' | 'en'>(() => {
    try { return (localStorage.getItem('language') as 'ja' | 'en') || 'ja' } catch { return 'ja' }
  })
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [tocOpen, setTocOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Restore theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
      else if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light')
      else document.documentElement.removeAttribute('data-theme')
    } catch {}
  }, [])

  // Intersection observer for TOC active state
  useEffect(() => {
    if (!mainRef.current) return
    const sections = mainRef.current.querySelectorAll<HTMLElement>('[data-category]')
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveCategory(e.target.getAttribute('data-category') ?? '')
          }
        }
      },
      { root: mainRef.current, rootMargin: '-10% 0px -70% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return ENTRIES.filter(e => {
      const title = lang === 'ja' ? e.titleJa : e.titleEn
      const bodyText = [
        ...(lang === 'ja' ? e.bodyJa : e.bodyEn).flatMap(b => [b.text ?? '', ...(b.items ?? [])]),
      ].join(' ')
      return title.toLowerCase().includes(q) || bodyText.toLowerCase().includes(q)
    })
  }, [query, lang])

  const scrollToCategory = (id: string) => {
    if (!mainRef.current) return
    const el = mainRef.current.querySelector<HTMLElement>(`[data-category="${id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col h-full bg-[var(--paper)] text-[var(--ink)]">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--line)] bg-[var(--surface)] shadow-[var(--sh-1)] flex-shrink-0">
        <button
          onClick={() => { window.location.hash = '' }}
          className="flex items-center gap-1.5 text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          <span className="hidden sm:inline">{lang === 'ja' ? 'アプリに戻る' : 'Back to app'}</span>
        </button>
        <div className="w-px h-5 bg-[var(--line)]" />
        <h1 className="text-[14px] font-semibold flex-1">
          {lang === 'ja' ? '使い方ガイド' : 'User Guide'}
        </h1>

        {/* Mobile TOC button */}
        <button
          onClick={() => setTocOpen(true)}
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-[var(--r-md)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          aria-label={lang === 'ja' ? '目次を開く' : 'Open table of contents'}
        >
          <Menu size={16} strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-0.5 rounded-[var(--r-md)] border border-[var(--line)] overflow-hidden">
          {(['ja', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-[12px] font-mono font-medium transition-colors ${
                lang === l
                  ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)]'
                  : 'text-[var(--ink-3)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile TOC drawer */}
      {tocOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setTocOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--line)] rounded-t-[var(--r-lg)] shadow-[var(--sh-4)] max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer handle */}
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-8 h-1 rounded-full bg-[var(--line-strong)]" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)] flex-shrink-0">
              <span className="text-[13px] font-semibold text-[var(--ink)]">
                {lang === 'ja' ? '目次' : 'Contents'}
              </span>
              <button
                onClick={() => setTocOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-[var(--r-sm)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            {/* Category list */}
            <div className="overflow-y-auto p-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setQuery('')
                    setTocOpen(false)
                    setTimeout(() => scrollToCategory(cat.id), 50)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-[var(--r-md)] text-[13px] transition-colors ${
                    activeCategory === cat.id && !query
                      ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)] font-semibold'
                      : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {lang === 'ja' ? cat.labelJa : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-safe-bottom flex-shrink-0 pb-4" />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-2.5 border-b border-[var(--line)] bg-[var(--surface)] flex-shrink-0">
        <div className="relative max-w-2xl">
          <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'ja' ? 'キーワードで検索（例：直交、ドラッグ、削除…）' : 'Search (e.g. ortho, drag, delete…)'}
            className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-[var(--paper)] border border-[var(--line)] rounded-[var(--r-md)] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:border-[var(--signal)] focus:ring-1 focus:ring-[var(--signal)]"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); searchRef.current?.focus() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-4)] hover:text-[var(--ink-2)]"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* TOC sidebar (desktop only) */}
        <aside className="hidden md:flex flex-col w-44 flex-shrink-0 border-r border-[var(--line)] bg-[var(--surface)] overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setQuery(''); scrollToCategory(cat.id) }}
                className={`w-full text-left px-2.5 py-1.5 rounded-[var(--r-md)] text-[12px] transition-colors ${
                  activeCategory === cat.id && !query
                    ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)] font-semibold'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {lang === 'ja' ? cat.labelJa : cat.labelEn}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-16">

            {filtered !== null ? (
              /* Search results */
              <div className="space-y-4">
                <p className="text-[13px] text-[var(--ink-3)] font-mono">
                  {filtered.length > 0
                    ? `${filtered.length} ${lang === 'ja' ? '件' : 'result(s)'}`
                    : lang === 'ja' ? '一致する項目が見つかりません' : 'No results found'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map(entry => (
                    <EntryCard key={entry.id} entry={entry} lang={lang} showCategory />
                  ))}
                </div>
              </div>
            ) : (
              /* Grouped by category */
              <div className="space-y-10">
                {CATEGORIES.map(cat => {
                  const entries = ENTRIES.filter(e => e.category === cat.id)
                  return (
                    <section key={cat.id} data-category={cat.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-[16px] font-bold text-[var(--ink)]">
                          {lang === 'ja' ? cat.labelJa : cat.labelEn}
                        </h2>
                        <div className="flex-1 h-px bg-[var(--line)]" />
                        <span className="text-[11px] font-mono text-[var(--ink-4)]">{entries.length} items</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entries.map(entry => (
                          <EntryCard key={entry.id} entry={entry} lang={lang} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
