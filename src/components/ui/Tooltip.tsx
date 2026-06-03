import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'bottom' }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={400}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 px-2.5 py-1.5 rounded-[5px] text-[12px] font-medium text-white bg-[#16181B] border border-white/10 shadow-lg max-w-[200px] text-center"
        >
          {content}
          <RadixTooltip.Arrow className="fill-[#16181B]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

export { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
