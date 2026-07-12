'use client'
import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="fade-in relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        {title && <h3 className="text-lg font-bold mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
