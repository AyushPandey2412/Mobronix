'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { QK, fetchQuestions } from '@/lib/adminQueries'
import QuestionsClient from './QuestionsClient'
import { Skeleton } from '@/components/ui/Skeleton'

export default function QuestionsPage() {
  const sb = useMemo(() => createBrowserClient(), [])

  const { data: questions = [], isLoading, isError, error } = useQuery({
    queryKey: QK.questions(),
    queryFn:  () => fetchQuestions(sb),
  })

  if (isLoading) return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-7 w-32"/><Skeleton className="h-4 w-48"/></div>
        <Skeleton className="h-9 w-32 rounded-md"/>
      </div>
      <Skeleton className="h-10 w-44 rounded-lg"/>
      <div className="space-y-2">
        {Array.from({length:5}).map((_,i)=>(
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
            <div className="flex flex-col gap-1 mt-1"><Skeleton className="h-3 w-4"/><Skeleton className="h-3 w-4"/></div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2"><Skeleton className="h-5 w-20 rounded-md"/></div>
              <Skeleton className="h-4 w-64"/>
              <div className="flex gap-1.5">{Array.from({length:3}).map((_,j)=><Skeleton key={j} className="h-6 w-20 rounded-md"/>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div className="rounded-lg border border-error-200 bg-error-50 px-5 py-4 text-body-sm text-error-700">
      Could not load questions: {(error as any)?.message}
    </div>
  )

  return <QuestionsClient questions={questions} />
}
