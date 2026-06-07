'use client'

import { useState } from 'react'
import type { Suggestion } from '@/lib/types'

interface PendingSuggestionCardProps {
  suggestion: Suggestion
  isPlanner: boolean
  onRespond: (id: string, action: 'approve' | 'decline') => Promise<void>
}

export default function PendingSuggestionCard({ suggestion, isPlanner, onRespond }: PendingSuggestionCardProps) {
  const [loading, setLoading] = useState<'approve' | 'decline' | null>(null)

  async function handle(action: 'approve' | 'decline') {
    setLoading(action)
    await onRespond(suggestion.id, action)
    setLoading(null)
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-coral-300 px-4 py-3 mb-2">
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none flex-shrink-0">
          {suggestion.suggested_emoji ?? '💡'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-[#1A0A00] truncate">{suggestion.text}</p>
          {suggestion.suggested_description && (
            <p className="text-sm text-[#1A0A00]/40 truncate mt-0.5">{suggestion.suggested_description}</p>
          )}
          <p className="text-xs text-coral-400 font-medium mt-0.5">
            suggested by {suggestion.submitter?.name ?? 'someone'}
          </p>
        </div>

        {isPlanner ? (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => handle('approve')}
              disabled={!!loading}
              className="w-9 h-9 rounded-xl bg-coral-100 flex items-center justify-center text-coral-500 active:scale-95 transition-transform disabled:opacity-40"
              aria-label="approve"
            >
              {loading === 'approve' ? '…' : '✓'}
            </button>
            <button
              onClick={() => handle('decline')}
              disabled={!!loading}
              className="w-9 h-9 rounded-xl bg-[#1A0A00]/5 flex items-center justify-center text-[#1A0A00]/40 active:scale-95 transition-transform disabled:opacity-40"
              aria-label="decline"
            >
              {loading === 'decline' ? '…' : '✕'}
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-coral-400 bg-coral-50 border border-coral-200 px-2.5 py-1 rounded-full flex-shrink-0">
            pending
          </span>
        )}
      </div>
    </div>
  )
}
