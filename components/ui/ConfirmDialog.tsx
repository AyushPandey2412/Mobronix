'use client'
import { useRef, useState } from 'react'
import Button from './Button'
import BottomSheet from './BottomSheet'
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', isPending = false, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; isPending?: boolean; onConfirm: () => void | Promise<unknown>; onCancel: () => void
}) {
  const locked = useRef(false)
  const [running, setRunning] = useState(false)
  const busy = isPending || running
  const cancel = () => { if (!locked.current && !isPending) onCancel() }
  return (
    <BottomSheet open={open} onClose={cancel} title={title}>
      <p className="text-sm text-ink-soft mb-5">{message}</p>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" disabled={busy} onClick={cancel}>Cancel</Button>
        <Button variant="danger" className="flex-1" isLoading={busy} onClick={async () => {
          if (locked.current || isPending) return
          locked.current = true; setRunning(true)
          try { await onConfirm() } catch { /* The caller displays the mutation error. */ }
          finally { locked.current = false; setRunning(false) }
        }}>{confirmLabel}</Button>
      </div>
    </BottomSheet>
  )
}
