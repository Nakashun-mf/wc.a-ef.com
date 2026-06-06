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

type DemoLang = 'ja' | 'en'

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

function AboutDemo({ lang }: { lang: DemoLang }) {
  const labels = lang === 'ja'
    ? ['点を追加', 'シミュレーション', '履歴管理']
    : ['Add points', 'Simulate', 'History']
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
          { icon: <Pen size={16} strokeWidth={1.75} />, label: labels[0] },
          { icon: <Play size={16} strokeWidth={1.75} />, label: labels[1] },
          { icon: <History size={16} strokeWidth={1.75} />, label: labels[2] },
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

function ScreenLayoutDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { toolbar: 'ツールバー', canvas: 'キャンバス\n（メインエリア）', coords: '座標\nリスト', history: '履歴' }
    : { toolbar: 'Toolbar', canvas: 'Canvas\n(main area)', coords: 'Coord\nlist', history: 'History' }
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden text-[10px] font-mono text-[var(--ink-3)]">
      <div className="px-3 py-2 bg-[var(--surface)] border-b border-[var(--line)] flex items-center gap-2">
        <span className="text-[var(--signal-ink)] font-semibold">{s.toolbar}</span>
        <div className="flex-1" />
        <span>▶</span><span>⚙</span>
      </div>
      <div className="flex" style={{ minHeight: 80 }}>
        <div className="flex-1 flex items-center justify-center border-r border-[var(--line)] text-[var(--ink-4)] text-center whitespace-pre-line leading-tight">
          {s.canvas}
        </div>
        <div className="w-20 flex flex-col divide-y divide-[var(--line)]">
          <div className="flex-1 flex items-center justify-center p-1 text-center leading-tight whitespace-pre-line">{s.coords}</div>
          <div className="flex-1 flex items-center justify-center p-1 text-center leading-tight">{s.history}</div>
        </div>
      </div>
    </div>
  )
}

function CoordSystemDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { x: '右 → プラス (+)', y: '上 → プラス (+)', origin: '原点 (0,0)' }
    : { x: 'Right → Positive (+)', y: 'Up → Positive (+)', origin: 'Origin (0,0)' }
  return (
    <svg viewBox="0 0 200 120" className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
      <line x1="40" y1="90" x2="170" y2="90" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="170,87 176,90 170,93" fill="var(--ink-3)" />
      <line x1="40" y1="90" x2="40" y2="20" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="37,20 40,14 43,20" fill="var(--ink-3)" />
      <circle cx="40" cy="90" r="3" fill="var(--ink-3)" />
      <text x="180" y="94" fontSize="12" fontFamily="var(--font-mono)" fill="var(--ink-2)" textAnchor="middle">X</text>
      <text x="40" y="10" fontSize="12" fontFamily="var(--font-mono)" fill="var(--ink-2)" textAnchor="middle">Y</text>
      <text x="100" y="108" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)" textAnchor="middle">{s.x}</text>
      <text x="10" y="55" fontSize="9" fontFamily="var(--font-mono)" fill="var(--ink-3)" textAnchor="middle" transform="rotate(-90 10 55)">{s.y}</text>
      <text x="42" y="100" fontSize="8" fontFamily="var(--font-mono)" fill="var(--ink-4)">{s.origin}</text>
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

function HorizontalLineDemo({ lang }: { lang: DemoLang }) {
  const path = makeDemoPath(
    [{ id: 'p1', x: -4, y: 0 }, { id: 'p2', x: 4, y: 0 }],
    [{ id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'horizontal', isConstrained: true }]
  )
  const label = lang === 'ja' ? '水平拘束（青）' : 'Horizontal (blue)'
  return (
    <MiniCanvas>
      <DemoPathLayer path={path} />
      <text x={MINI_W / 2} y={MINI_H - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--info)" textAnchor="middle" style={{ userSelect: 'none', pointerEvents: 'none' }}>{label}</text>
    </MiniCanvas>
  )
}

function VerticalLineDemo({ lang }: { lang: DemoLang }) {
  const path = makeDemoPath(
    [{ id: 'p1', x: 0, y: -3 }, { id: 'p2', x: 0, y: 3 }],
    [{ id: 's1', fromPointId: 'p1', toPointId: 'p2', orientation: 'vertical', isConstrained: true }]
  )
  const label = lang === 'ja' ? '垂直拘束（緑）' : 'Vertical (green)'
  return (
    <MiniCanvas>
      <DemoPathLayer path={path} />
      <text x={MINI_W / 2} y={MINI_H - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--signal)" textAnchor="middle" style={{ userSelect: 'none', pointerEvents: 'none' }}>{label}</text>
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

function CoordDialogDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { title: 'P2 の座標を編集', confirm: '確定', cancel: 'キャンセル', delete: 'この点を削除' }
    : { title: 'Edit P2 coordinates', confirm: 'Confirm', cancel: 'Cancel', delete: 'Delete this point' }
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 flex items-center justify-center">
      <div className="rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] p-4 w-48 space-y-3">
        <p className="text-[12px] font-semibold text-[var(--ink)]">{s.title}</p>
        {(['X', 'Y'] as const).map((axis, i) => (
          <label key={axis} className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">{axis} mm</span>
            <div className="mt-0.5 px-2 py-1.5 text-[12px] font-mono bg-[var(--paper)] border border-[var(--line-2)] rounded-[var(--r-sm)] text-[var(--ink)]">
              {i === 0 ? '0.00' : '-2.00'}
            </div>
          </label>
        ))}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-1.5 text-center text-[11px] rounded-[var(--r-md)] bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] font-medium">{s.confirm}</div>
          <div className="flex-1 py-1.5 text-center text-[11px] rounded-[var(--r-md)] border border-[var(--line)] text-[var(--ink-3)]">{s.cancel}</div>
        </div>
        <div className="pt-1 text-center text-[11px] text-[var(--danger)]">{s.delete}</div>
      </div>
    </div>
  )
}

function ContextMenuDemo({ lang }: { lang: DemoLang }) {
  const label = lang === 'ja' ? '拘束を解除' : 'Release constraint'
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-8">
      <MiniCanvas className="!w-32">
        <DemoPathLayer path={ORTHO_PATH} selectedSegmentId="s1" />
      </MiniCanvas>
      <div className="rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] overflow-hidden min-w-[100px]">
        <div className="px-3 py-2 text-[12px] text-[var(--ink-2)] flex items-center gap-2 hover:bg-[var(--surface-2)]">
          <Unlink size={12} strokeWidth={1.75} />
          {label}
        </div>
      </div>
    </div>
  )
}

function UndoLimitDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { stack: 'Undoスタック', max: '最大 50 ステップ' }
    : { stack: 'Undo stack', max: 'Max 50 steps' }
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
          <span>{s.stack}</span><span>{s.max}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <div className="h-full bg-[var(--signal)] rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

function SimRequirementsDemo({ lang }: { lang: DemoLang }) {
  const label = lang === 'ja' ? '2点以上あればシミュレーション開始可' : 'Simulation ready with 2+ points'
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
        <span className="text-[11px] text-[var(--ink-3)]">{label}</span>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-[var(--r-md)] bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] text-[11px] font-medium">
          <Play size={11} strokeWidth={1.75} />▶
        </div>
      </div>
    </div>
  )
}

function SimSpeedDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { speed: '速度', value: '10 mm/秒', slow: '低速', fast: '高速' }
    : { speed: 'Speed', value: '10 mm/s', slow: 'Slow', fast: 'Fast' }
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[var(--ink-3)]">{s.speed}</span>
        <span className="text-[11px] font-mono text-[var(--ink-2)]">{s.value}</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--line)]">
        <div className="absolute left-0 top-0 h-full w-2/5 rounded-full bg-[var(--signal)]" />
        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[var(--surface)] border-2 border-[var(--signal)] shadow-sm" style={{ left: 'calc(40% - 8px)' }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-[var(--ink-4)]">{s.slow}</span>
        <span className="text-[9px] font-mono text-[var(--ink-4)]">{s.fast}</span>
      </div>
    </div>
  )
}

function RenamePathDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { title: '名前を変更', value: '2025-06-01 加工経路A', hint: 'Enter で確定、Esc でキャンセル' }
    : { title: 'Rename', value: '2025-06-01 Route-A', hint: 'Enter to confirm, Esc to cancel' }
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-4 space-y-2">
      <p className="text-[11px] font-mono text-[var(--ink-3)]">{s.title}</p>
      <div className="flex gap-2">
        <div className="flex-1 px-2 py-1.5 text-[12px] font-mono bg-[var(--surface)] border border-[var(--signal)] rounded-[var(--r-sm)] text-[var(--ink)]">
          {s.value}
        </div>
      </div>
      <p className="text-[10px] text-[var(--ink-4)]">{s.hint}</p>
    </div>
  )
}

function DeletePathDemo({ lang }: { lang: DemoLang }) {
  const names = lang === 'ja'
    ? ['加工経路A', '加工経路B', '加工経路C']
    : ['Route A', 'Route B', 'Route C']
  const delLabel = lang === 'ja' ? '削除' : 'Delete'
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden">
      {names.map((name, i) => (
        <div key={name} className={`flex items-center px-3 py-2 border-b border-[var(--line)] last:border-b-0 ${i === 1 ? 'bg-[var(--danger-wash)]' : ''}`}>
          <span className={`text-[12px] flex-1 ${i === 1 ? 'text-[var(--danger)]' : 'text-[var(--ink-2)]'}`}>{name}</span>
          {i === 1 && <span className="text-[10px] font-semibold text-[var(--danger)] border border-[var(--danger)] rounded px-1.5 py-0.5">{delLabel}</span>}
        </div>
      ))}
    </div>
  )
}

function AutoSaveDemo({ lang }: { lang: DemoLang }) {
  const s = lang === 'ja'
    ? { title: '自動保存済み', sub: '最終保存：14:35' }
    : { title: 'Auto-saved', sub: 'Last saved: 14:35' }
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-8 flex flex-col items-center gap-3">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[var(--signal-wash)] border border-[var(--signal-line)]">
        <FilePlus size={22} strokeWidth={1.75} color="var(--signal-ink)" />
      </div>
      <p className="text-[12px] font-semibold text-[var(--ink)]">{s.title}</p>
      <p className="text-[10px] font-mono text-[var(--ink-4)]">{s.sub}</p>
    </div>
  )
}

function ThemeDemo({ lang }: { lang: DemoLang }) {
  const labels = lang === 'ja'
    ? ['システム', 'ライト', 'ダーク']
    : ['System', 'Light', 'Dark']
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] p-3 flex gap-2 justify-center">
      {[
        { icon: <Monitor size={14} strokeWidth={1.75} />, label: labels[0] },
        { icon: <Sun size={14} strokeWidth={1.75} />, label: labels[1] },
        { icon: <Moon size={14} strokeWidth={1.75} />, label: labels[2] },
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

function AddModeDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 900)
  const isAdd = step <= 1
  const addLabel = lang === 'ja' ? '追加モード' : 'Add mode'
  const editLabel = lang === 'ja' ? '編集モード' : 'Edit mode'
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-8">
      {[
        { icon: <Pen size={16} strokeWidth={1.75} />, label: addLabel, active: isAdd },
        { icon: <MousePointer size={16} strokeWidth={1.75} />, label: editLabel, active: !isAdd },
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

function AddPointDemo({ lang }: { lang: DemoLang }) {
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
  const ptsLabel = lang === 'ja' ? `P${count > 0 ? count : '?'} / 3点` : `P${count > 0 ? count : '?'} / 3 pts`
  return (
    <div className="relative">
      <MiniCanvas>{count > 0 && <DemoPathLayer path={path} />}</MiniCanvas>
      <DemoLabel>{ptsLabel}</DemoLabel>
    </div>
  )
}

function SnapToGridDemo({ lang }: { lang: DemoLang }) {
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
  const label = snapProgress < 1
    ? (lang === 'ja' ? `自由位置 (${x.toFixed(1)}, ${y.toFixed(1)})` : `Free pos (${x.toFixed(1)}, ${y.toFixed(1)})`)
    : (lang === 'ja' ? 'スナップ済 (0.0, 0.0)' : 'Snapped (0.0, 0.0)')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId="p2" /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function OrthoOnDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1200)
  const isOrtho = step >= 2
  const label = isOrtho
    ? (lang === 'ja' ? '直交モード ON' : 'Ortho ON')
    : (lang === 'ja' ? '直交モード OFF' : 'Ortho OFF')
  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={isOrtho ? ORTHO_PATH : FREE_PATH} />
      </MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
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

function DeselectPointDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 900)
  const selectedId = step <= 1 ? 'p2' : null
  const label = selectedId
    ? (lang === 'ja' ? '選択中' : 'Selected')
    : (lang === 'ja' ? '選択解除' : 'Deselected')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} selectedPointId={selectedId} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function LongPressDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(5, 600)
  const isPulsing = step === 2 || step === 3
  const showDialog = step >= 3
  const cx = MINI_T.offsetX + 0 * MINI_T.scale
  const cy = MINI_T.offsetY - (-2) * MINI_T.scale
  const dialogLabel = lang === 'ja' ? '座標入力ダイアログ' : 'Coordinate editor'
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
            {dialogLabel}
          </div>
        </div>
      )}
    </div>
  )
}

function DeletePointDemo({ lang }: { lang: DemoLang }) {
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
  const label = hasMid
    ? (lang === 'ja' ? '3点' : '3 pts')
    : (lang === 'ja' ? '削除後 → 2点' : 'After delete → 2 pts')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId={isMidSelected ? 'p2' : null} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function SelectSegmentDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1000)
  const segId = step === 0 ? null : step === 1 ? 's1' : step === 2 ? 's2' : 's3'
  const label = segId
    ? (lang === 'ja' ? `${segId} 選択中` : `${segId} selected`)
    : (lang === 'ja' ? '未選択' : 'None selected')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} selectedSegmentId={segId} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function ReleaseConstraintDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1100)
  const isConstrained = step <= 1
  const path = isConstrained
    ? ORTHO_PATH
    : makeDemoPath(ORTHO_PATH.points, ORTHO_PATH.segments.map(s => ({ ...s, isConstrained: false, orientation: 'free' as const })))
  const label = isConstrained
    ? (lang === 'ja' ? '拘束あり' : 'Constrained')
    : (lang === 'ja' ? '拘束解除済' : 'Released')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function EditModeDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1000)
  const isEdit = step >= 2
  const addLabel = lang === 'ja' ? '追加モード' : 'Add mode'
  const editLabel = lang === 'ja' ? '編集モード' : 'Edit mode'
  const addDesc = lang === 'ja' ? 'タップで追加' : 'Tap to add'
  const editDesc = lang === 'ja' ? 'ドラッグでパン' : 'Drag to pan'
  return (
    <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] py-6 flex items-center justify-center gap-6">
      {[
        { icon: <Pen size={16} strokeWidth={1.75} />, label: addLabel, desc: addDesc, active: !isEdit },
        { icon: <MousePointer size={16} strokeWidth={1.75} />, label: editLabel, desc: editDesc, active: isEdit },
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

function SnapToggleDemo({ lang }: { lang: DemoLang }) {
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
  const label = snapOn
    ? (lang === 'ja' ? 'スナップ ON（グリッドに吸着）' : 'Snap ON (snaps to grid)')
    : (lang === 'ja' ? 'スナップ OFF（任意位置）' : 'Snap OFF (free position)')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} selectedPointId="p2" /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function GridToggleDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1000)
  const showGrid = step <= 1
  const transform: CanvasTransform = { scale: 22, offsetX: MINI_W / 2, offsetY: MINI_H / 2 }
  const label = lang === 'ja'
    ? (showGrid ? 'グリッド ON' : 'グリッド OFF')
    : (showGrid ? 'Grid ON' : 'Grid OFF')
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)]">
        {showGrid && <Grid transform={transform} gridSizeMm={2} width={MINI_W} height={MINI_H} />}
        <PathLayer path={ORTHO_PATH} selectedPointId={null} selectedSegmentId={null} transform={transform}
          onPointClick={() => {}} onSegmentClick={() => {}} onPointDragStart={() => {}}
          onSegmentPointerDown={() => {}} onSegmentPointerUp={() => {}} onSegmentContextMenu={() => {}} />
      </svg>
      <DemoLabel>{label}</DemoLabel>
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
        <span className="font-mono font-semibold text-[var(--signal-ink)] text-[12px]">P2</span>
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

function ListReleaseConstraintDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 900)
  const isConstrained = step <= 1
  const constrainedLabel = lang === 'ja' ? '拘束あり → Unlinkボタンで解除' : 'Constrained → tap Unlink to release'
  const releasedLabel = lang === 'ja' ? '✓ 拘束解除済み' : '✓ Constraint released'
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
        {isConstrained ? constrainedLabel : releasedLabel}
      </div>
    </div>
  )
}

function ShowCoordsDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1000)
  const showCoords = step >= 2
  const label = showCoords
    ? (lang === 'ja' ? '座標表示 ON' : 'Coords ON')
    : (lang === 'ja' ? '座標表示 OFF' : 'Coords OFF')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} showCoords={showCoords} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function UndoDemo({ lang }: { lang: DemoLang }) {
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
  const label = hasMid
    ? (lang === 'ja' ? '操作前（3点）' : 'Before (3 pts)')
    : (lang === 'ja' ? 'Undo → 2点' : 'Undo → 2 pts')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function RedoDemo({ lang }: { lang: DemoLang }) {
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
  const label = hasMid
    ? (lang === 'ja' ? 'Redo → 3点に戻る' : 'Redo → back to 3 pts')
    : (lang === 'ja' ? 'Undo後（2点）' : 'After Undo (2 pts)')
  return (
    <div className="relative">
      <MiniCanvas><DemoPathLayer path={path} /></MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function SimLoopDemo({ endBehavior, lang }: { endBehavior?: 'pause' | 'restart' | 'skip' | 'stop'; lang: DemoLang }) {
  const t = useLoopT(4000)
  let progress: number
  let label = ''

  const pct = (p: number) => `${(p * 100).toFixed(0)}%`

  if (!endBehavior) {
    progress = t
    label = pct(t)
  } else if (endBehavior === 'pause') {
    progress = t < 0.45 ? t / 0.45 * 0.5 : t < 0.7 ? 0.5 : 0
    label = t >= 0.45 && t < 0.7
      ? (lang === 'ja' ? '一時停止中' : 'Paused')
      : pct(progress)
  } else if (endBehavior === 'restart') {
    progress = t < 0.5 ? t * 0.9 : t < 0.55 ? 0 : (t - 0.55) * 0.9
    label = t >= 0.5 && t < 0.55
      ? (lang === 'ja' ? '← 最初から再生' : '← Restarting')
      : pct(progress)
  } else if (endBehavior === 'skip') {
    progress = t < 0.4 ? t / 0.4 * 0.35 : t < 0.45 ? 1 : t < 0.7 ? 1 : 0
    label = t >= 0.4 && t < 0.45
      ? (lang === 'ja' ? '→ スキップ' : '→ Skipping')
      : pct(progress)
  } else {
    progress = t < 0.5 ? t * 0.9 : 0
    label = t >= 0.5
      ? (lang === 'ja' ? '停止済み' : 'Stopped')
      : pct(progress)
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

function SimResumeDemo({ lang }: { lang: DemoLang }) {
  const t = useLoopT(4000)
  const paused = t < 0.35
  const progress = paused ? 0.35 : 0.35 + (t - 0.35) / 0.65 * 0.65
  const label = paused
    ? (lang === 'ja' ? '一時停止中 → 再開待ち' : 'Paused → waiting to resume')
    : (lang === 'ja' ? `再開 ${(progress * 100).toFixed(0)}%` : `Resumed ${(progress * 100).toFixed(0)}%`)
  return (
    <div className="relative">
      <MiniCanvas>
        <DemoPathLayer path={ORTHO_PATH} />
        <SimulationLayer path={ORTHO_PATH} progress={progress} transform={MINI_T} />
      </MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function NewPathDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(5, 700)
  const hasPath = step <= 2
  const label = hasPath
    ? (lang === 'ja' ? '現在の経路' : 'Current route')
    : (lang === 'ja' ? '新規作成後（空）' : 'After New (empty)')
  return (
    <div className="relative">
      <MiniCanvas>
        {hasPath && <DemoPathLayer path={ORTHO_PATH} />}
      </MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function OpenPathDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(5, 800)
  const showPath = step >= 3
  const selIdx = step === 1 || step === 2 ? 1 : -1
  const routes = lang === 'ja'
    ? ['2025-06-01  経路A', '2025-06-03  経路B', '2025-06-05  経路C']
    : ['2025-06-01  Route-A', '2025-06-03  Route-B', '2025-06-05  Route-C']
  const openLabel = lang === 'ja' ? '開く' : 'Open'
  const loadedLabel = lang === 'ja' ? '経路を読み込み済み' : 'Route loaded'
  const selectingLabel = lang === 'ja' ? '履歴から選択中' : 'Selecting from history'
  return (
    <div className="relative w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] overflow-hidden">
      {!showPath ? (
        <div className="flex flex-col divide-y divide-[var(--line)]">
          {routes.map((r, i) => (
            <div key={r} className={`px-3 py-2 flex items-center gap-2 text-[12px] transition-colors ${i === selIdx ? 'bg-[var(--signal-wash)] text-[var(--signal-ink)]' : 'text-[var(--ink-2)]'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
              {r}
              {i === selIdx && <span className="ml-auto text-[10px] border border-[var(--signal)] rounded px-1.5 py-0.5">{openLabel}</span>}
            </div>
          ))}
        </div>
      ) : (
        <MiniCanvas><DemoPathLayer path={ORTHO_PATH} /></MiniCanvas>
      )}
      <div className="absolute bottom-2 right-2">
        <DemoLabel>{showPath ? loadedLabel : selectingLabel}</DemoLabel>
      </div>
    </div>
  )
}

function ClearPathDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(5, 700)
  const hasPath = step <= 2
  const label = hasPath
    ? (lang === 'ja' ? 'クリア前' : 'Before clear')
    : (lang === 'ja' ? 'クリア後（空）' : 'After clear (empty)')
  return (
    <div className="relative">
      <MiniCanvas>
        {hasPath && <DemoPathLayer path={FREE_PATH} />}
      </MiniCanvas>
      <DemoLabel>{label}</DemoLabel>
    </div>
  )
}

function ShowCoordsSettingDemo({ lang }: { lang: DemoLang }) {
  const step = useStepLoop(4, 1000)
  const showCoords = step >= 2
  const settingLabel = lang === 'ja' ? '点の座標を表示' : 'Show point coordinates'
  return (
    <div className="relative space-y-1">
      <div className="w-full rounded-[var(--r-md)] bg-[var(--paper-2)] border border-[var(--line)] px-3 py-2 flex items-center justify-between">
        <span className="text-[12px] text-[var(--ink-2)]">{settingLabel}</span>
        <div className={`h-5 w-9 rounded-full transition-colors flex items-center px-0.5 ${showCoords ? 'bg-[var(--signal)] justify-end' : 'bg-[var(--line-2)] justify-start'}`}>
          <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
        </div>
      </div>
      <MiniCanvas><DemoPathLayer path={ORTHO_PATH} showCoords={showCoords} /></MiniCanvas>
    </div>
  )
}

// ── Demo map ──────────────────────────────────────────────────────────────────

const DEMO_MAP: Record<string, (lang: DemoLang) => ReactElement> = {
  'about':                      (l) => <AboutDemo lang={l} />,
  'screen-layout':              (l) => <ScreenLayoutDemo lang={l} />,
  'coordinate-system':          (l) => <CoordSystemDemo lang={l} />,
  'add-mode':                   (l) => <AddModeDemo lang={l} />,
  'add-point':                  (l) => <AddPointDemo lang={l} />,
  'point-label':                (_) => <PointLabelDemo />,
  'snap-to-grid':               (l) => <SnapToGridDemo lang={l} />,
  'ortho-on':                   (l) => <OrthoOnDemo lang={l} />,
  'horizontal-line':            (l) => <HorizontalLineDemo lang={l} />,
  'vertical-line':              (l) => <VerticalLineDemo lang={l} />,
  'constraint-mark':            (_) => <ConstraintMarkDemo />,
  'free-segment':               (_) => <FreeSegmentDemo />,
  'select-point':               (_) => <SelectPointDemo />,
  'drag-point':                 (_) => <DragPointDemo />,
  'deselect-point':             (l) => <DeselectPointDemo lang={l} />,
  'longpress-point':            (l) => <LongPressDemo lang={l} />,
  'coord-dialog':               (l) => <CoordDialogDemo lang={l} />,
  'delete-point':               (l) => <DeletePointDemo lang={l} />,
  'select-segment':             (l) => <SelectSegmentDemo lang={l} />,
  'release-constraint-canvas':  (l) => <ReleaseConstraintDemo lang={l} />,
  'segment-context-menu':       (l) => <ContextMenuDemo lang={l} />,
  'edit-mode':                  (l) => <EditModeDemo lang={l} />,
  'pan-canvas':                 (_) => <PanCanvasDemo />,
  'pinch-zoom':                 (_) => <ZoomDemo />,
  'snap-toggle':                (l) => <SnapToggleDemo lang={l} />,
  'grid-toggle':                (l) => <GridToggleDemo lang={l} />,
  'list-overview':              (_) => <ListOverviewDemo />,
  'list-select':                (_) => <ListSelectDemo />,
  'list-inline-edit':           (_) => <ListInlineEditDemo />,
  'list-release-constraint':    (l) => <ListReleaseConstraintDemo lang={l} />,
  'show-coords-option':         (l) => <ShowCoordsDemo lang={l} />,
  'undo':                       (l) => <UndoDemo lang={l} />,
  'redo':                       (l) => <RedoDemo lang={l} />,
  'undo-limit':                 (l) => <UndoLimitDemo lang={l} />,
  'sim-requirements':           (l) => <SimRequirementsDemo lang={l} />,
  'sim-start':                  (l) => <SimLoopDemo lang={l} />,
  'sim-speed':                  (l) => <SimSpeedDemo lang={l} />,
  'sim-pause':                  (l) => <SimLoopDemo endBehavior="pause" lang={l} />,
  'sim-resume':                 (l) => <SimResumeDemo lang={l} />,
  'sim-restart':                (l) => <SimLoopDemo endBehavior="restart" lang={l} />,
  'sim-skip':                   (l) => <SimLoopDemo endBehavior="skip" lang={l} />,
  'sim-stop':                   (l) => <SimLoopDemo endBehavior="stop" lang={l} />,
  'sim-trail':                  (l) => <SimLoopDemo lang={l} />,
  'new-path':                   (l) => <NewPathDemo lang={l} />,
  'open-path':                  (l) => <OpenPathDemo lang={l} />,
  'rename-path':                (l) => <RenamePathDemo lang={l} />,
  'delete-path':                (l) => <DeletePathDemo lang={l} />,
  'clear-path':                 (l) => <ClearPathDemo lang={l} />,
  'autosave':                   (l) => <AutoSaveDemo lang={l} />,
  'theme':                      (l) => <ThemeDemo lang={l} />,
  'language':                   (_) => <LanguageDemo />,
  'show-coords-setting':        (l) => <ShowCoordsSettingDemo lang={l} />,
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

function EntryCard({ entry, lang, showCategory = false }: { entry: ManualEntry; lang: DemoLang; showCategory?: boolean }) {
  const Demo = DEMO_MAP[entry.id]
  const title = lang === 'ja' ? entry.titleJa : entry.titleEn
  const body = lang === 'ja' ? entry.bodyJa : entry.bodyEn
  const cat = CATEGORIES.find(c => c.id === entry.category)

  return (
    <div id={`entry-${entry.id}`} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
      {Demo && (
        <div className="p-3 bg-[var(--paper)] border-b border-[var(--line)]">
          {Demo(lang)}
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
  const [lang, setLang] = useState<DemoLang>(() => {
    try { return (localStorage.getItem('language') as DemoLang) || 'ja' } catch { return 'ja' }
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
                    : (lang === 'ja' ? '一致する項目が見つかりません' : 'No results found')
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
                        <span className="text-[11px] font-mono text-[var(--ink-4)]">
                          {lang === 'ja' ? `${entries.length} 件` : `${entries.length} items`}
                        </span>
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
