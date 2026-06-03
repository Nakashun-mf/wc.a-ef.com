import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open onOpenChange={v => !v && onCancel()} title={title}>
      {description && (
        <p className="text-[14px] text-[var(--ink-2)] mb-5">{description}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {t('confirm.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('confirm.yes')}
        </Button>
      </div>
    </Dialog>
  )
}
