'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_TASK_LABELS, getLocalDateString } from '@/lib/utils'
import type { Meal } from '@/lib/types'

interface AddMealModalProps {
  householdId: string
  userId: string
  editMeal?: Meal
  initialDate?: string
  onClose: () => void
  onAdded: () => void
}

const EMOJI_SUGGESTIONS = ['🍕','🍣','🌮','🍝','🥘','🍔','🍜','🥗','🍗','🫕','🥩','🐟','🍛','🥦','🫔']

export default function AddMealModal({ householdId, userId, editMeal, initialDate, onClose, onAdded }: AddMealModalProps) {
  const today = getLocalDateString(0)
  const [name, setName] = useState(editMeal?.name ?? '')
  const [description, setDescription] = useState(editMeal?.description ?? '')
  const [emoji, setEmoji] = useState(editMeal?.emoji ?? '')
  const [date, setDate] = useState(editMeal?.scheduled_date ?? initialDate ?? today)
  const [cookTime, setCookTime] = useState(editMeal?.cook_time_minutes?.toString() ?? '')
  const [customTasks, setCustomTasks] = useState(DEFAULT_TASK_LABELS.join('\n'))
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)

    try {
      if (editMeal) {
        const { error } = await supabase.rpc('update_meal', {
          p_meal_id: editMeal.id,
          p_name: name.trim(),
          p_description: description.trim() || null,
          p_emoji: emoji || null,
          p_scheduled_date: date,
          p_cook_time_minutes: cookTime ? parseInt(cookTime, 10) : null,
        })
        if (error) throw error
      } else {
        const { data: meal, error: mErr } = await supabase
          .from('meals')
          .insert({
            household_id: householdId,
            name: name.trim(),
            description: description.trim() || null,
            emoji: emoji || null,
            scheduled_date: date,
            cook_time_minutes: cookTime ? parseInt(cookTime, 10) : null,
            created_by: userId,
          })
          .select()
          .single()
        if (mErr) throw mErr

        const taskLabels = customTasks.split('\n').map((l) => l.trim()).filter(Boolean)
        if (taskLabels.length > 0) {
          await supabase.from('tasks').insert(
            taskLabels.map((label) => ({ meal_id: meal.id, household_id: householdId, label }))
          )
        }

        await fetch('/api/notifications/new-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mealId: meal.id }),
        })
      }

      onAdded()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="w-full max-w-mobile bg-white rounded-t-3xl px-5 pt-5 pb-safe max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{editMeal ? 'edit meal' : 'add a meal'}</h2>
          <button onClick={onClose} className="text-[#1A0A00]/40 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">meal name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Spaghetti Bolognese"
              className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">emoji</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg border transition-all ${
                    emoji === e ? 'border-coral-400 bg-coral-100' : 'border-coral-100 bg-coral-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="or type any emoji"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
              short description <span className="text-[#1A0A00]/30">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. with garlic bread and salad"
              className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">date</label>
              <input
                type="date"
                value={date}
                min={editMeal ? undefined : today}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">cook time</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="mins"
                min={5}
                max={480}
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
              />
            </div>
          </div>

          {!editMeal && (
            <div>
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">tasks (one per line)</label>
              <textarea
                value={customTasks}
                onChange={(e) => setCustomTasks(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-coral-200 text-[#1A0A00]/70 font-medium rounded-xl text-sm active:scale-[0.98] transition-transform"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {saving ? '…' : editMeal ? 'save changes' : 'add meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
