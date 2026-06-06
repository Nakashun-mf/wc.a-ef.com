import { useState } from 'react'
import { MousePointer, List, Play, Magnet, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export const ONBOARDING_KEY = 'wc-onboarding-done'

function OrthoPageIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 16 16" fill="none" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,12 3,4 11,4" />
      <line x1="3" y1="12" x2="11" y2="4" strokeDasharray="2 2" opacity={0.4} />
    </svg>
  )
}

interface OnboardingDialogProps {
  open: boolean
  onClose: () => void
}

export function OnboardingDialog({ open, onClose }: OnboardingDialogProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setPage(0)
    onClose()
  }

  const pages = [
    {
      icon: <MousePointer size={20} strokeWidth={1.75} />,
      title: t('onboarding.page1.title'),
      body: t('onboarding.page1.body'),
    },
    {
      icon: <List size={20} strokeWidth={1.75} />,
      title: t('onboarding.page2.title'),
      body: t('onboarding.page2.body'),
    },
    {
      icon: <OrthoPageIcon />,
      title: t('onboarding.page3.title'),
      body: t('onboarding.page3.body'),
    },
    {
      icon: <Magnet size={20} strokeWidth={1.75} />,
      title: t('onboarding.page4.title'),
      body: t('onboarding.page4.body'),
    },
    {
      icon: <Play size={20} strokeWidth={1.75} />,
      title: t('onboarding.page5.title'),
      body: t('onboarding.page5.body'),
    },
  ]

  const current = pages[page]
  const isFirst = page === 0
  const isLast = page === pages.length - 1

  return (
    <Dialog
      open={open}
      onOpenChange={v => !v && handleClose()}
      title={t('onboarding.title')}
      badge={`${page + 1} / ${pages.length}`}
      className="max-w-md"
    >
      <div className="flex flex-col items-center text-center gap-4 mb-6 min-h-[140px] justify-center">
        <div className="h-14 w-14 rounded-[var(--r-lg)] bg-[var(--signal-wash)] flex items-center justify-center text-[var(--signal-ink)] flex-shrink-0">
          {current.icon}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[var(--ink)] mb-2">
            {current.title}
          </p>
          <p className="text-[13px] text-[var(--ink-2)] leading-relaxed whitespace-pre-line">
            {current.body}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-5">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`rounded-full transition-all ${
              i === page
                ? 'w-4 h-1.5 bg-[var(--signal)]'
                : 'w-1.5 h-1.5 bg-[var(--line-strong)] hover:bg-[var(--ink-3)]'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {!isFirst && (
          <Button variant="secondary" className="flex-1" onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} strokeWidth={2} />
            {t('onboarding.prev')}
          </Button>
        )}
        {isLast ? (
          <Button variant="primary" className="flex-1" onClick={handleClose}>
            {t('onboarding.close')}
          </Button>
        ) : (
          <Button
            variant="primary"
            className={isFirst ? 'w-full' : 'flex-1'}
            onClick={() => setPage(p => p + 1)}
          >
            {t('onboarding.next')}
            <ChevronRight size={14} strokeWidth={2} />
          </Button>
        )}
      </div>

      {!isLast && (
        <button
          onClick={handleClose}
          className="w-full text-center text-[12px] text-[var(--ink-3)] hover:text-[var(--ink-2)] mt-3 transition-colors"
        >
          {t('onboarding.skip')}
        </button>
      )}
    </Dialog>
  )
}
