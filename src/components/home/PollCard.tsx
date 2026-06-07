'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Poll } from '@/lib/types'

interface PollCardProps {
  poll: Poll
  userId: string
  householdId: string
  isPlanner: boolean
  onUpdate: () => void
}

export default function PollCard({ poll, userId, householdId, isPlanner, onUpdate }: PollCardProps) {
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const supabase = createClient()

  const responses = poll.responses ?? []
  const myResponse = responses.find((r) => r.user_id === userId)
  const countA = responses.filter((r) => r.choice === 'a').length
  const countB = responses.filter((r) => r.choice === 'b').length
  const total = countA + countB

  async function vote(choice: 'a' | 'b') {
    if (submitting || myResponse) return
    setSubmitting(true)
    await supabase.from('poll_responses').insert({
      poll_id: poll.id,
      user_id: userId,
      household_id: householdId,
      choice,
    })
    setSubmitting(false)
    onUpdate()
  }

  async function closePoll() {
    setClosing(true)
    await supabase.from('polls').update({ closed: true }).eq('id', poll.id)
    setClosing(false)
    onUpdate()
  }

  const showResults = isPlanner || !!myResponse

  return (
    <div className="mx-4 mb-4">
      <div className="bg-white rounded-2xl border border-coral-100 px-4 py-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-coral-500 uppercase tracking-widest">poll</span>
            <p className="text-base font-semibold text-[#1A0A00] mt-0.5 leading-snug">{poll.question}</p>
          </div>
          {isPlanner && (
            <button
              onClick={closePoll}
              disabled={closing}
              className="shrink-0 text-xs text-[#1A0A00]/40 border border-[#1A0A00]/10 px-2.5 py-1 rounded-full active:scale-95 transition-transform mt-0.5"
            >
              {closing ? '…' : 'close'}
            </button>
          )}
        </div>

        {showResults ? (
          <div className="space-y-3">
            {(['a', 'b'] as const).map((choice) => {
              const label = choice === 'a' ? poll.option_a : poll.option_b
              const count = choice === 'a' ? countA : countB
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const isMyChoice = myResponse?.choice === choice
              return (
                <div key={choice}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-medium ${isMyChoice ? 'text-coral-500' : 'text-[#1A0A00]/70'}`}>
                      {isMyChoice && '✓ '}{label}
                    </span>
                    <span className="text-sm text-[#1A0A00]/40">{count} {count === 1 ? 'vote' : 'votes'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-coral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isMyChoice ? 'bg-coral-400' : 'bg-coral-200'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {!isPlanner && myResponse && (
              <p className="text-xs text-[#1A0A00]/30 text-center pt-0.5">your vote is in</p>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            {(['a', 'b'] as const).map((choice) => {
              const label = choice === 'a' ? poll.option_a : poll.option_b
              return (
                <button
                  key={choice}
                  onClick={() => vote(choice)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border-2 border-coral-200 bg-coral-50 text-base font-medium text-[#1A0A00]/80 active:scale-[0.97] active:bg-coral-100 transition-all disabled:opacity-50"
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
