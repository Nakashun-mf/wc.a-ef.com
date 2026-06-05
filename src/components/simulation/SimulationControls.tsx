import { SkipForward, Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { useSimulation } from '@/hooks/useSimulation'
import { Slider } from '@/components/ui/Slider'
import { Button } from '@/components/ui/Button'

export function SimulationControls() {
  const { t } = useTranslation()
  const simulation = useAppStore(s => s.simulation)
  const setSimulation = useAppStore(s => s.setSimulation)
  const stopSimulation = useAppStore(s => s.stopSimulation)
  const { skip } = useSimulation()

  if (!simulation.running && simulation.progress < 1) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div
        className="flex flex-col gap-2 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)]"
        style={{ minWidth: 260 }}
      >
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
          <span className="text-[12px] font-mono text-[var(--ink-3)] w-14 text-right">
            {simulation.speedMmPerSec} {t('simulation.speedUnit')}
          </span>
        </div>

        {/* Row 2: Skip / Stop */}
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={skip}>
            <SkipForward size={14} strokeWidth={1.75} />
            {t('simulation.skip')}
          </Button>
          <Button size="sm" variant="ghost" onClick={stopSimulation}>
            <Square size={14} strokeWidth={1.75} />
            {t('simulation.stop')}
          </Button>
        </div>
      </div>
    </div>
  )
}
