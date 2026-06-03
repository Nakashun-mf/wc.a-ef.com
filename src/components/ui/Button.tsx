import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from './utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  active?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium transition-all select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1',
          'disabled:opacity-40 disabled:pointer-events-none',
          'active:translate-y-px',
          {
            'bg-[var(--signal)] text-white hover:bg-[var(--signal-bright)] shadow-[var(--sh-1)]':
              variant === 'primary',
            'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line-2)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] shadow-[var(--sh-1)]':
              variant === 'secondary',
            'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]':
              variant === 'ghost',
            'bg-[var(--danger)] text-white hover:opacity-90':
              variant === 'danger',
            'bg-[var(--signal-wash)] text-[var(--signal-ink)] border border-[var(--signal-line)]':
              active && variant !== 'primary',
          },
          {
            'h-7 px-2.5 text-[13px] rounded-[var(--r-sm)]': size === 'sm',
            'h-9 px-3.5 text-[14px] rounded-[var(--r-md)]': size === 'md',
            'h-10 px-4 text-[15px] rounded-[var(--r-md)]': size === 'lg',
            'h-8 w-8 rounded-[var(--r-md)] p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
