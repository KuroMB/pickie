'use client'

import { createClient } from '@/lib/supabase/client'
import type { Suggestion, SuggestionStatus } from '@/lib/types'

interface SuggestionInboxProps {
  suggestions: Suggestion[]
  isPlanner: boolean
  onUpdate: () => void
}

const STATUS_LABEL: Record<SuggestionStatus, string> = {
  open: '',
  noted: 'noted',
  added: 'added to rotation',
}

const STATUS_STYLE: Record<SuggestionStatus, string> = {
  open: '',
  noted: 'bg-amber-100 text-amber-700',
  added: 'bg-coral-100 text-coral-500',
}

export default function SuggestionInbox({ suggestions, isPlanner, onUpdate }: SuggestionInboxProps) {
  const supabase = createClient()

  async function updateStatus(id: string, status: SuggestionStatus) {
    await supabase.from('suggestions').update({ status }).eq('id', id)
    onUpdate()
  }

  if (suggestions.length === 0) {
    return (
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest mb-3">
          suggestions
        </p>
        <div className="bg-coral-50 rounded-2xl px-4 py-6 text-center border border-coral-100">
          <p className="text-sm text-[#1A0A00]/40">no suggestions yet — use the field below</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-4">
      <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest mb-3">
        suggestions
      </p>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-coral-100 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#1A0A00]/40 mb-1 leading-none">
                  <span className="font-medium text-[#1A0A00]/60">
                    {s.submitter?.name ?? 'someone'}
                  </span>
                  {' · '}
                  {s.type === 'remix' ? (
                    <>remix · <span className="italic">{s.meal?.name}</span></>
                  ) : (
                    'general'
                  )}
                </p>
                <p className="text-sm text-[#1A0A00]/80 leading-snug">{s.text}</p>
              </div>
              {s.status !== 'open' && (
                <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
              )}
            </div>

            {isPlanner && (
              <div className="mt-2.5 flex gap-2">
                {s.status !== 'noted' && (
                  <button
                    onClick={() => updateStatus(s.id, 'noted')}
                    className="text-[11px] font-medium text-[#1A0A00]/50 border border-[#1A0A00]/15 px-3 py-1 rounded-full hover:border-[#1A0A00]/25 active:scale-95 transition-transform"
                  >
                    noted
                  </button>
                )}
                {s.status !== 'added' && (
                  <button
                    onClick={() => updateStatus(s.id, 'added')}
                    className="text-[11px] font-medium text-coral-400 border border-coral-300 px-3 py-1 rounded-full active:scale-95 transition-transform"
                  >
                    add to rotation
                  </button>
                )}
                {s.status !== 'open' && (
                  <button
                    onClick={() => updateStatus(s.id, 'open')}
                    className="text-[11px] font-medium text-[#1A0A00]/40 px-2 py-1 active:scale-95 transition-transform"
                  >
                    undo
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
