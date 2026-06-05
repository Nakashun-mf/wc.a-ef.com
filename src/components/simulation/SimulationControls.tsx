import { Pause, Play, RotateCcw, SkipForward, Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { useSimulation } from '@/hooks/useSimulation'
import { Slider } from '@/components/ui/Slider'
import { Button } from '@/components/ui/Button'

export function SimulationControls() {
  const { t } = useTranslation()
  const simulation = useAppStore(s => s.simulation)
  const setSimulation = useAppStore(s => s.setSimulation)
  const startSimulation = useAppStore(s => s.startSimulation)
  const { skip } = useSimulation()

  // Show while running, paused, or completed
  if (!simulation.running && simulation.progress <= 0) return null

  const isRunning = simulation.running
  const isComplete = simulation.progress >= 1
  const isPaused = !isRunning && !isComplete && simulation.progress > 0

  const pause = () => setSimulation({ running: false })
  const resume = () => setSimulation({ running: true })
  const stop = () => setSimulation({ running: false, progress: 0, trailProgress: 0 })

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[85vw] max-w-[480px]">
      <div className="flex flex-col gap-2 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)]">
        {/* Row 1: speed slider */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--ink-2)] whitespace-nowrap">
            {t('simulation.speed')}
          </span>
          <div className="flex-1">
            <Slider
              value={simulation.speedMmPerSec}
              min={1}
              max={100}
              step={1}
              onChange={v => setSimulation({ speedMmPerSec: v })}
            />
          </div>
          <span className="text-[12px] font-mono text-[var(--ink-3)] w-14 text-right shrink-0">
            {simulation.speedMmPerSec} {t('simulation.speedUnit')}
          </span>
        </div>

        {/* Row 2: action buttons */}
        <div className="flex items-center justify-center gap-2">
          {isComplete ? (
            // Completed: Restart + End
            <>
              <Button size="sm" variant="ghost" onClick={startSimulation}>
                <RotateCcw size={14} strokeWidth={1.75} />
                {t('simulation.restart')}
              </Button>
              <Button size="sm" variant="ghost" onClick={stop}>
                <Square size={14} strokeWidth={1.75} />
                {t('simulation.end')}
              </Button>
            </>
          ) : (
            // Running or paused
            <>
              {isRunning && (
                <Button size="sm" variant="ghost" onClick={pause}>
                  <Pause size={14} strokeWidth={1.75} />
                  {t('simulation.pause')}
                </Button>
              )}
              {isPaused && (
                <Button size="sm" variant="ghost" onClick={resume}>
                  <Play size={14} strokeWidth={1.75} />
                  {t('simulation.resume')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={skip}>
                <SkipForward size={14} strokeWidth={1.75} />
                {t('simulation.skip')}
              </Button>
              <Button size="sm" variant="ghost" onClick={stop}>
                <Square size={14} strokeWidth={1.75} />
                {t('simulation.end')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
