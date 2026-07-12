import Link from 'next/link'
import AdminNav from './AdminNav'
import AdminAuthGate from './AdminAuthGate'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-background flex">
        <aside className="hidden md:flex w-56 shrink-0 flex-col bg-surface border-r border-border sticky top-0 h-screen">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <Link href="/admin" className="inline-flex items-center gap-2 font-bold tracking-[-0.02em]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-[15px] font-extrabold text-white">S</span>
              <span className="text-text-primary text-sm">Sell<span className="text-brand">My</span>iPhone</span>
            </Link>
            <p className="mt-1 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Admin</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <AdminNav />
          </div>
          <div className="px-3 py-3 border-t border-border">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-neutral-100 transition-colors text-body-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to site
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <Link href="/admin" className="inline-flex items-center gap-2 font-bold tracking-[-0.02em]">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-[13px] font-extrabold text-white">S</span>
              <span className="text-text-primary text-sm">Admin</span>
            </Link>
            <AdminNav horizontal />
          </div>
          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </AdminAuthGate>
  )
}
