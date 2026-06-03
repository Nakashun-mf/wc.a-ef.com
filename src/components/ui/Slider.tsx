import * as RadixSlider from '@radix-ui/react-slider'
import { cn } from './utils'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  className?: string
}

export function Slider({ value, min, max, step = 1, onChange, className }: SliderProps) {
  return (
    <RadixSlider.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      className={cn('relative flex items-center select-none touch-none w-full h-5', className)}
    >
      <RadixSlider.Track className="relative h-1.5 grow rounded-full bg-[var(--line-2)]">
        <RadixSlider.Range className="absolute h-full rounded-full bg-[var(--signal)]" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-4 w-4 rounded-full bg-white border-2 border-[var(--signal)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1 hover:bg-[var(--signal-wash)]" />
    </RadixSlider.Root>
  )
}
