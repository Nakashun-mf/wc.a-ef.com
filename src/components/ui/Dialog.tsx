import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from './utils'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, title, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-lg)]',
            'shadow-[var(--sh-4)] w-[calc(100vw-32px)] max-w-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
            <RadixDialog.Title className="text-[15px] font-semibold text-[var(--ink)]">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button className="h-7 w-7 rounded-[var(--r-sm)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors">
                <X size={16} strokeWidth={1.75} />
              </button>
            </RadixDialog.Close>
          </div>
          <div className="p-5">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
