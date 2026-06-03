import * as Popover from '@radix-ui/react-popover'
import { Settings, Sun, Moon, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import type { Theme, Language } from '@/domain/types'

export function SettingsPopover() {
  const { t, i18n } = useTranslation()
  const theme = useAppStore(s => s.theme)
  const language = useAppStore(s => s.language)
  const setTheme = useAppStore(s => s.setTheme)
  const setLanguage = useAppStore(s => s.setLanguage)

  const handleLanguage = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'system', label: t('settings.themeSystem'), icon: Monitor },
    { value: 'light', label: t('settings.themeLight'), icon: Sun },
    { value: 'dark', label: t('settings.themeDark'), icon: Moon },
  ]

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button size="icon" variant="ghost">
          <Settings size={16} strokeWidth={1.75} />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--sh-3)] p-4 space-y-4"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-2">
              {t('settings.theme')}
            </p>
            <div className="flex gap-1.5">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-[var(--r-md)] text-[12px] transition-colors border ${
                    theme === value
                      ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]'
                      : 'bg-transparent border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-2">
              {t('settings.language')}
            </p>
            <div className="flex gap-1.5">
              {(['ja', 'en'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguage(lang)}
                  className={`flex-1 py-1.5 rounded-[var(--r-md)] text-[13px] font-medium transition-colors border ${
                    language === lang
                      ? 'bg-[var(--signal-wash)] border-[var(--signal-line)] text-[var(--signal-ink)]'
                      : 'bg-transparent border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {lang === 'ja' ? t('settings.langJa') : t('settings.langEn')}
                </button>
              ))}
            </div>
          </div>

          <Popover.Arrow className="fill-[var(--surface)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
