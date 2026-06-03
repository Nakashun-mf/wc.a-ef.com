import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import { CoordinateList } from './CoordinateList'
import { HistoryList } from './HistoryList'

export function SidePanel() {
  const { t } = useTranslation()

  return (
    <aside className="w-64 xl:w-72 flex flex-col border-l border-[var(--line)] bg-[var(--surface)] flex-shrink-0">
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
    </aside>
  )
}
