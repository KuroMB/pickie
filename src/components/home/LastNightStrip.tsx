'use client'

import { useState } from 'react'
import RatingSlider from '@/components/ui/RatingSlider'
import { createClient } from '@/lib/supabase/client'
import type { MealWithState } from '@/lib/types'

interface LastNightStripProps {
  meal: MealWithState
  userId: string
  householdId: string
  onRated: () => void
}

export default function LastNightStrip({ meal, userId, householdId, onRated }: LastNightStripProps) {
  const [score, setScore] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  async function submitRating() {
    setSubmitting(true)
    const { error } = await supabase.from('ratings').upsert({
      meal_id: meal.id,
      user_id: userId,
      household_id: householdId,
      score,
    })
    setSubmitting(false)
    if (!error) {
      setSubmitted(true)
      setTimeout(onRated, 1200)
    }
  }

  if (submitted) {
    return (
      <div className="mx-4 mb-3 bg-coral-100 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{meal.emoji ?? '🍽️'}</span>
          <span className="text-sm font-medium truncate">{meal.name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-[#1A0A00]/50">you rated</span>
          <span className="text-sm font-medium text-coral-400">{score}/10</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-3 bg-coral-100 rounded-2xl px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{meal.emoji ?? '🍽️'}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#1A0A00]/50 leading-none mb-0.5">last night</p>
          <p className="text-sm font-medium truncate">{meal.name}</p>
        </div>
      </div>
      <RatingSlider value={score} onChange={setScore} disabled={submitting} />
      <button
        onClick={submitRating}
        disabled={submitting}
        className="mt-3 w-full py-2.5 bg-coral-400 text-white text-sm font-medium rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {submitting ? 'saving…' : 'submit rating'}
      </button>
    </div>
  )
}
