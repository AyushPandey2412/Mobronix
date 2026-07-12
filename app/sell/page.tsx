import Link from 'next/link'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Sell Your Device', robots: { index: false } }

export default function SellCategory() {
  return (
    <div className="max-w-lg mx-auto px-5 py-10 fade-in">
      <h1 className="text-2xl font-bold">What do you want to sell?</h1>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/sell/iphone" className="rounded-card border border-line bg-white p-8 text-center hover:border-accent-border">
          <div className="text-4xl">📱</div><p className="mt-3 font-semibold">iPhone</p>
        </Link>
        <Link href="/sell/macbook" className="rounded-card border border-line bg-white p-8 text-center hover:border-accent-border">
          <div className="text-4xl">💻</div><p className="mt-3 font-semibold">MacBook</p>
        </Link>
      </div>
    </div>
  )
}
