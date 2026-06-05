'use client'

import { useState } from 'react'
import VoteButtons from '@/components/ui/VoteButtons'
import { createClient } from '@/lib/supabase/client'
import { formatShortDay, VOTE_EMOJI } from '@/lib/utils'
import type { MealWithState, VoteValue } from '@/lib/types'

interface MealCardProps {
  meal: MealWithState
  userId: string
  householdId: string
  isPlanner: boolean
  onUpdate: () => void
}

export default function MealCard({ meal, userId, householdId, isPlanner, onUpdate }: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [remix, setRemix] = useState('')
  const [sendingRemix, setSendingRemix] = useState(false)
  const [myVote, setMyVote] = useState<VoteValue | null>(meal.myVote ?? null)
  const [tally, setTally] = useState(meal.voteTally)
  const supabase = createClient()

  const canVote = meal.state === 'upcoming'

  async function handleVote(value: VoteValue | null) {
    const prev = myVote
    setMyVote(value)
    setTally((t) => {
      const next = { ...t }
      if (prev) next[prev] = Math.max(0, next[prev] - 1)
      if (value) next[value]++
      return next
    })

    if (prev && !value) {
      await supabase.from('votes').delete().eq('meal_id', meal.id).eq('user_id', userId)
    } else if (value) {
      await supabase.from('votes').upsert({
        meal_id: meal.id,
        user_id: userId,
        household_id: householdId,
        value,
      })
    }
  }

  async function sendRemix() {
    if (!remix.trim()) return
    setSendingRemix(true)
    await supabase.from('suggestions').insert({
      meal_id: meal.id,
      household_id: householdId,
      submitted_by: userId,
      type: 'remix',
      text: remix.trim(),
    })
    setRemix('')
    setSendingRemix(false)
    onUpdate()
  }

  return (
    <div className="bg-white rounded-2xl border border-coral-100 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-coral-50/50 transition-colors"
      >
        <div className="flex-shrink-0 w-9 text-center">
          <p className="text-[10px] font-medium text-[#1A0A00]/40 uppercase tracking-wide leading-none">
            {formatShortDay(meal.scheduled_date)}
          </p>
          <span className="text-2xl leading-tight">{meal.emoji ?? '🍽️'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate leading-tight">{meal.name}</p>
          {meal.description && !expanded && (
            <p className="text-xs text-[#1A0A00]/40 truncate mt-0.5">{meal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {tally.love > 0 && (
            <span className="text-xs text-[#1A0A00]/50">{VOTE_EMOJI.love}{tally.love}</span>
          )}
          {tally.meh > 0 && (
            <span className="text-xs text-[#1A0A00]/50">{VOTE_EMOJI.meh}{tally.meh}</span>
          )}
          {tally.nope > 0 && (
            <span className="text-xs text-[#1A0A00]/50">{VOTE_EMOJI.nope}{tally.nope}</span>
          )}
          <svg
            className={`w-4 h-4 text-[#1A0A00]/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-coral-100">
          {meal.description && (
            <p className="text-sm text-[#1A0A00]/60 pt-3 pb-3 leading-relaxed">{meal.description}</p>
          )}

          {canVote ? (
            <>
              <VoteButtons
                value={myVote}
                onVote={handleVote}
                tally={tally}
              />
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={remix}
                  onChange={(e) => setRemix(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendRemix()}
                  placeholder="suggest a remix…"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
                />
                <button
                  onClick={sendRemix}
                  disabled={!remix.trim() || sendingRemix}
                  className="px-4 py-2.5 bg-coral-400 text-white text-sm font-medium rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
                >
                  send
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3">
              <p className="text-xs text-[#1A0A00]/40 text-center py-2">
                voting closed
              </p>
              <div className="flex gap-2 mt-1">
                <VoteButtons value={null} onVote={() => {}} tally={tally} disabled />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
