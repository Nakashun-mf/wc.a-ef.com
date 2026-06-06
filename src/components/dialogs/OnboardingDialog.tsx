import { useState } from 'react'
import { MousePointer, List, Play, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

function OrthoStepIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,12 3,4 11,4" />
    </svg>
  )
}

const ONBOARDING_KEY = 'wc-onboarding-done'

export function OnboardingDialog() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(() => !localStorage.getItem(ONBOARDING_KEY))

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setOpen(false)
  }

  const steps = [
    { icon: <MousePointer size={15} strokeWidth={1.75} />, text: t('onboarding.step1') },
    { icon: <List size={15} strokeWidth={1.75} />, text: t('onboarding.step2') },
    { icon: <OrthoStepIcon />, text: t('onboarding.step3') },
    { icon: <Play size={15} strokeWidth={1.75} />, text: t('onboarding.step4') },
    { icon: <RotateCcw size={15} strokeWidth={1.75} />, text: t('onboarding.step5') },
  ]

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()} title={t('onboarding.title')}>
      <div className="space-y-3 mb-5">
        {steps.map(({ icon, text }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-[var(--r-md)] bg-[var(--signal-wash)] flex items-center justify-center flex-shrink-0 text-[var(--signal-ink)]">
              {icon}
            </div>
            <p className="text-[14px] text-[var(--ink-2)] pt-0.5">{text}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" className="w-full" onClick={handleClose}>
        {t('onboarding.close')}
      </Button>
    </Dialog>
  )
}
