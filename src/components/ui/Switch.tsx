import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from './utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Switch({ checked, onCheckedChange, label, size = 'md', className }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer select-none', className)}>
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative rounded-full transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1',
          checked ? 'bg-[var(--signal)]' : 'bg-[var(--line-2)]',
          size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            'block rounded-full bg-white shadow-sm transition-transform',
            size === 'sm'
              ? 'h-3 w-3 translate-x-0.5 data-[state=checked]:translate-x-3.5'
              : 'h-4 w-4 translate-x-0.5 data-[state=checked]:translate-x-4.5'
          )}
        />
      </RadixSwitch.Root>
      {label && <span className="text-[13px] text-[var(--ink-2)]">{label}</span>}
    </label>
  )
}
