'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { QK, fetchModels } from '@/lib/adminQueries'
import ProductsClient from './ProductsClient'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProductsPage() {
  const sb = useMemo(() => createBrowserClient(), [])

  const { data: models = [], isLoading, isError, error } = useQuery({
    queryKey: QK.models(),
    queryFn:  () => fetchModels(sb),
  })

  if (isLoading) return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-7 w-28"/><Skeleton className="h-4 w-44"/></div>
        <Skeleton className="h-9 w-28 rounded-md"/>
      </div>
      <Skeleton className="h-10 w-44 rounded-lg"/>
      <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
        {Array.from({length:5}).map((_,i)=>(
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex flex-col gap-1"><Skeleton className="h-3 w-3"/><Skeleton className="h-3 w-3"/></div>
            <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-32"/><Skeleton className="h-3 w-48"/></div>
            <Skeleton className="h-7 w-14 rounded-md"/>
            <Skeleton className="h-7 w-12 rounded-md"/>
          </div>
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div className="rounded-lg border border-error-200 bg-error-50 px-5 py-4 text-body-sm text-error-700">
      Could not load products: {(error as any)?.message}
    </div>
  )

  return <ProductsClient models={models} />
}
