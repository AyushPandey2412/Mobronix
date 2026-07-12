'use client'
import Button from './Button'
import BottomSheet from './BottomSheet'
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-ink-soft mb-5">{message}</p>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </BottomSheet>
  )
}
