import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CoordinateList } from './CoordinateList'
import { HistoryList } from './HistoryList'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-sm flex flex-col bg-[var(--surface)] border-l border-[var(--line)] shadow-[var(--sh-4)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] flex-shrink-0">
            <Dialog.Title className="text-[14px] font-semibold text-[var(--ink)]">
              Wire EDM
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="h-8 w-8 rounded-[var(--r-sm)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors">
                <X size={16} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue="current" className="flex flex-col flex-1 overflow-hidden">
            <Tabs.List className="flex border-b border-[var(--line)] flex-shrink-0">
              {[
                { value: 'current', label: t('sidebar.currentPath') },
                { value: 'history', label: t('sidebar.history') },
              ].map(tab => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 py-2.5 text-[13px] font-medium text-[var(--ink-3)] border-b-2 border-transparent transition-colors data-[state=active]:text-[var(--ink)] data-[state=active]:border-[var(--signal)]"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="current" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
              <CoordinateList />
            </Tabs.Content>

            <Tabs.Content value="history" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
              <HistoryList />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
