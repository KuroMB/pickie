'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils'

interface HaveAgainButtonProps {
  mealName: string
  emoji: string | null
  description: string | null
  householdId: string
  userId: string
}

export default function HaveAgainButton({ mealName, emoji, description, householdId, userId }: HaveAgainButtonProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(getLocalDateString(7))
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function schedule() {
    if (!date) return
    setSaving(true)
    const { data: meal } = await supabase
      .from('meals')
      .insert({ household_id: householdId, added_by: userId, name: mealName, emoji, description, scheduled_date: date })
      .select('id')
      .single()

    if (meal) {
      await supabase.from('tasks').insert([
        { meal_id: meal.id, household_id: householdId, label: 'cook', done: false },
        { meal_id: meal.id, household_id: householdId, label: 'shop', done: false },
      ])
    }
    setSaving(false)
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false) }, 1200)
  }

  if (done) {
    return (
      <span className="text-xs font-medium text-coral-400">scheduled ✓</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-coral-400 bg-coral-50 border border-coral-200 px-2.5 py-1 rounded-full active:scale-95 transition-transform"
      >
        have again
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={date}
        min={getLocalDateString(1)}
        onChange={(e) => setDate(e.target.value)}
        className="text-sm px-2 py-1 rounded-lg border border-coral-200 bg-coral-50 focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 appearance-none min-w-0"
      />
      <button
        onClick={schedule}
        disabled={saving || !date}
        className="text-xs font-medium text-white bg-coral-400 px-3 py-1.5 rounded-full disabled:opacity-50 active:scale-95 transition-transform"
      >
        {saving ? '…' : 'schedule'}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-[#1A0A00]/40"
      >
        cancel
      </button>
    </div>
  )
}
