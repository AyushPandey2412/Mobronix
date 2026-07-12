'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastHost'
import BottomSheet from '@/components/ui/BottomSheet'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { formatFactorDelta } from '@/lib/pricing'
import { QK, QK_PUBLIC, upsertQuestion, patchQuestion, deleteQuestion } from '@/lib/adminQueries'
import type { Question, QuestionCategory, QuestionOption, QuestionType } from '@/lib/types'

type Tab = 'iphone' | 'macbook'

export default function QuestionsClient({ questions }: { questions: Question[] }) {
  const sb    = useMemo(() => createBrowserClient(), [])
  const toast = useToast()
  const qc    = useQueryClient()

  const [tab,        setTab]        = useState<Tab>('iphone')
  const [editing,    setEditing]    = useState<Question | null>(null)
  const [creating,   setCreating]   = useState(false)
  const [confirmDel, setConfirmDel] = useState<Question | null>(null)

  const list = questions
    .filter(q => q.category === tab || q.category === 'all')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  const moveMutation = useMutation({
    mutationFn: ({ q, dir }: { q: Question; dir: -1|1 }) =>
      patchQuestion(sb, { id: q.id!, patch: { order_index: (q.order_index ?? 0) + dir } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.questions() }); qc.invalidateQueries({ queryKey: QK_PUBLIC.questions() }) },
    onError:   (e: any) => toast(e.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (q: Question) => deleteQuestion(sb, q.id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.questions() })
      qc.invalidateQueries({ queryKey: QK_PUBLIC.questions() })
      setConfirmDel(null)
      toast('Question deleted', 'info')
    },
    onError: (e: any) => toast(e.message, 'error'),
  })

  const TYPE_LABEL: Record<string, string> = { single: 'Single choice', multi: 'Multi choice', matrix: 'Matrix' }

  return (
    <div className="space-y-5 max-w-3xl fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-extrabold text-text-primary tracking-tight">Questions</h1>
          <p className="text-body-sm text-text-tertiary mt-0.5">Condition quiz · affects buyback price</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-body-sm transition-colors shadow-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add question
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit">
        {(['iphone','macbook'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 rounded-md text-body-sm font-medium transition-all',
              tab === t ? 'bg-surface text-text-primary shadow-xs' : 'text-text-tertiary hover:text-text-primary')}>
            {t === 'iphone' ? 'iPhone' : 'MacBook'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <div className="rounded-xl border border-border bg-surface py-12 text-center">
            <p className="text-text-tertiary text-body-sm">No questions for {tab} yet.</p>
            <button onClick={() => setCreating(true)} className="mt-3 text-brand text-body-sm font-medium hover:underline">Add the first one</button>
          </div>
        )}
        {list.map(q => (
          <div key={q.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-0.5 mt-0.5">
              <button onClick={() => moveMutation.mutate({ q, dir: -1 })} disabled={moveMutation.isPending}
                className="w-6 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-text-disabled hover:text-text-secondary transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button onClick={() => moveMutation.mutate({ q, dir: 1 })} disabled={moveMutation.isPending}
                className="w-6 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-text-disabled hover:text-text-secondary transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-caption font-semibold">
                  {TYPE_LABEL[q.type ?? 'single'] || q.type}
                </span>
                {q.category === 'all' && <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-text-tertiary text-caption font-semibold">All devices</span>}
                <span className="font-mono text-caption text-text-disabled">#{q.order_index}</span>
              </div>
              <p className="text-body-sm font-semibold text-text-primary">{q.question_text}</p>
              {q.hint_text && <p className="text-caption text-text-tertiary mt-0.5">{q.hint_text}</p>}
              {q.type !== 'matrix' && q.options && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {q.options.map((o, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-text-secondary">
                      {o.label}
                      <span className={cn('font-mono font-semibold', o.factor < 1 ? 'text-warning-600' : o.factor > 1 ? 'text-success-600' : 'text-text-tertiary')}>
                        {formatFactorDelta(o.factor)}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {q.type === 'matrix' && <p className="text-caption text-text-tertiary mt-1.5">{q.matrix_items?.length ?? 0} device functions</p>}
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              {q.type !== 'matrix' ? (
                <button onClick={() => setEditing(q)}
                  className="h-7 px-2.5 rounded-md text-caption font-medium border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-neutral-50 transition-colors">
                  Edit
                </button>
              ) : (
                <span className="h-7 px-2.5 flex items-center text-caption text-text-disabled">View only</span>
              )}
              <button onClick={() => setConfirmDel(q)}
                className="h-7 px-2.5 rounded-md text-caption font-medium text-error-600 hover:bg-error-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <QuestionEditor
          sb={sb} toast={toast} qc={qc} defaultCategory={tab} question={editing}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}

      <ConfirmDialog open={!!confirmDel} title="Delete this question?"
        message="This removes it from the condition quiz. Existing enquiries are not affected."
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        onConfirm={() => confirmDel && deleteMutation.mutate(confirmDel)}
        onCancel={() => setConfirmDel(null)} />
    </div>
  )
}

function QuestionEditor({ sb, toast, qc, defaultCategory, question, onClose }: any) {
  const [text,      setText]      = useState(question?.question_text || '')
  const [hint,      setHint]      = useState(question?.hint_text || '')
  const [category,  setCategory]  = useState<QuestionCategory>(question?.category || defaultCategory)
  const isMatrix = question?.type === 'matrix'
  const [type,      setType]      = useState<QuestionType>(isMatrix ? 'matrix' : (question?.type || 'single'))
  const [exclusive, setExclusive] = useState(question?.exclusive_option || '')
  const [options,   setOptions]   = useState<QuestionOption[]>(question?.options || [{ label: '', factor: 1 }])

  const inputCls = "w-full h-10 bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-3 text-body-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] transition-all"
  const selectCls = "h-10 bg-surface border border-border text-text-primary rounded-md px-3 text-body-sm outline-none focus:border-brand transition-all w-full"

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!text.trim()) throw new Error('Enter the question text')
      // For matrix questions, preserve the existing type + items + options instead
      // of coercing to single and wiping matrix_items (which destroyed the config).
      const payload = isMatrix
        ? {
            question_text: text, hint_text: hint || null, category, type: 'matrix',
            exclusive_option: null,
            options: question?.options ?? null,
            matrix_items: question?.matrix_items ?? null,
            order_index: question?.order_index ?? 99, is_active: true,
          }
        : {
            question_text: text, hint_text: hint || null, category, type,
            exclusive_option: type === 'multi' ? (exclusive || null) : null,
            options: options.filter(o => o.label.trim()), matrix_items: null,
            order_index: question?.order_index ?? 99, is_active: true,
          }
      return upsertQuestion(sb, { payload, existingId: question?.id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.questions() })
      qc.invalidateQueries({ queryKey: QK_PUBLIC.questions() })
      toast('Saved', 'success')
      onClose()
    },
    onError: (e: any) => toast(e.message, 'error'),
  })

  return (
    <BottomSheet open onClose={onClose} title={question ? 'Edit question' : 'Add question'}>
      <div className="space-y-4">
        <div><label className="block text-caption font-medium text-text-secondary mb-1.5">Question text</label>
          <input className={inputCls} value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. Does the screen have any scratches?"/></div>
        <div><label className="block text-caption font-medium text-text-secondary mb-1.5">Hint (optional)</label>
          <input className={inputCls} value={hint} onChange={e=>setHint(e.target.value)} placeholder="Shown below the question"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-caption font-medium text-text-secondary mb-1.5">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value as QuestionCategory)} className={selectCls}>
              <option value="iphone">iPhone</option>
              <option value="macbook">MacBook</option>
              <option value="all">All devices</option>
            </select></div>
          <div><label className="block text-caption font-medium text-text-secondary mb-1.5">Type</label>
            <select value={type} onChange={e=>setType(e.target.value as QuestionType)} disabled={isMatrix} className={cn(selectCls, isMatrix && "opacity-60 cursor-not-allowed")}>
              {isMatrix && <option value="matrix">Matrix (multi-item)</option>}
              <option value="single">Single choice</option>
              <option value="multi">Multi choice</option>
            </select></div>
        </div>
        {isMatrix && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2.5 text-caption text-warning-800">
            This is a multi-item (matrix) question. Its items &amp; factors are preserved as-is — only the text, hint and category are editable here.
          </div>
        )}
        {!isMatrix && type === 'multi' && (
          <div><label className="block text-caption font-medium text-text-secondary mb-1.5">Exclusive option</label>
            <input className={inputCls} placeholder="e.g. No issues" value={exclusive} onChange={e=>setExclusive(e.target.value)}/></div>
        )}
        {!isMatrix && <div>
          <label className="block text-caption font-medium text-text-secondary mb-1.5">
            Options <span className="text-text-disabled font-normal">· factor: 1.0 = no change, 0.9 = −10%</span>
          </label>
          <div className="space-y-2">
            {options.map((o,i)=>(
              <div key={i} className="flex gap-2">
                <input value={o.label} onChange={e=>setOptions(os=>os.map((x,j)=>j===i?{...x,label:e.target.value}:x))}
                  placeholder="Option label" className="flex-1 h-9 bg-surface border border-border text-text-primary placeholder:text-text-disabled rounded-md px-2.5 text-body-sm outline-none focus:border-brand transition-all"/>
                <input type="number" step="0.01" min="0" max="2" value={o.factor} onChange={e=>setOptions(os=>os.map((x,j)=>j===i?{...x,factor:Number(e.target.value)}:x))}
                  className="w-20 h-9 bg-surface border border-border text-text-primary rounded-md px-2.5 text-body-sm font-mono outline-none focus:border-brand transition-all"/>
                <button onClick={()=>setOptions(os=>os.filter((_,j)=>j!==i))}
                  className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-error-50 text-error-500 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            <button onClick={()=>setOptions(os=>[...os,{label:'',factor:1}])} className="text-brand text-body-sm font-medium hover:underline">+ Add option</button>
          </div>
        </div>}
        <button onClick={()=>saveMutation.mutate()} disabled={saveMutation.isPending}
          className="w-full h-10 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold rounded-md text-body-sm transition-colors shadow-xs flex items-center justify-center gap-2">
          {saveMutation.isPending && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0" strokeLinecap="round"/></svg>}
          {saveMutation.isPending ? 'Saving…' : 'Save question'}
        </button>
      </div>
    </BottomSheet>
  )
}
