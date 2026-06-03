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
        className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)]"
        style={{ minWidth: 280 }}
      >
        <span className="text-[13px] font-medium text-[var(--ink-2)]">
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
        <span className="text-[12px] font-mono text-[var(--ink-3)] w-16 text-right">
          {simulation.speedMmPerSec} {t('simulation.speedUnit')}
        </span>
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
  )
}
