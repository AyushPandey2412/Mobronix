'use client'
import { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: number; message: string; kind: 'info' | 'success' | 'error' }
const ToastCtx = createContext<(message: string, kind?: Toast['kind']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export default function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`fade-in rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white ${
            t.kind === 'success' ? 'bg-accent' : t.kind === 'error' ? 'bg-warn' : 'bg-ink'
          }`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
