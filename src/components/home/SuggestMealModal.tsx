'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const EMOJI_SUGGESTIONS = ['🍕','🍣','🌮','🍝','🥘','🍔','🍜','🥗','🍗','🫕','🥩','🐟','🍛','🥦','🫔','🌯','🥪','🍖','🍟','🥚']

interface SuggestMealModalProps {
  userId: string
  householdId: string
  suggestedDate: string
  onClose: () => void
  onSent: () => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export default function SuggestMealModal({ userId, householdId, suggestedDate, onClose, onSent }: SuggestMealModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [description, setDescription] = useState('')
  const [showCustomEmoji, setShowCustomEmoji] = useState(false)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSending(true)
    try {
      await supabase.from('suggestions').insert({
        household_id: householdId,
        submitted_by: userId,
        type: 'general',
        text: name.trim(),
        status: 'open',
        suggested_date: suggestedDate,
        suggested_emoji: emoji || null,
        suggested_description: description.trim() || null,
      })

      await fetch('/api/notifications/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId: null, mealName: name.trim(), suggestedDate }),
      })

      onSent()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const inputClass = 'w-full min-w-0 appearance-none px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-base focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="w-full max-w-mobile bg-white rounded-t-3xl px-5 pt-5 pb-safe max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold">suggest a meal</h2>
          <button onClick={onClose} className="text-[#1A0A00]/40 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-coral-400 font-medium mb-5">{formatDate(suggestedDate)}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-[#1A0A00]/60 mb-1.5">meal name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Tacos"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-[#1A0A00]/60 mb-1.5">emoji <span className="text-[#1A0A00]/30 font-normal">(optional)</span></label>
            <div className="flex gap-2 flex-wrap mb-2">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEmoji(e); setShowCustomEmoji(false) }}
                  className={`text-2xl p-1.5 rounded-lg border transition-all ${emoji === e ? 'border-coral-400 bg-coral-100' : 'border-coral-100 bg-coral-50'}`}
                >
                  {e}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomEmoji(true)}
                className={`text-base font-bold p-1.5 w-10 h-10 rounded-lg border transition-all flex items-center justify-center ${showCustomEmoji ? 'border-coral-400 bg-coral-100 text-coral-500' : 'border-coral-100 bg-coral-50 text-[#1A0A00]/40'}`}
              >
                +
              </button>
            </div>
            {showCustomEmoji && (
              <input
                type="text"
                value={EMOJI_SUGGESTIONS.includes(emoji) ? '' : emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="type or paste any emoji"
                maxLength={4}
                autoFocus
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-[#1A0A00]/60 mb-1.5">
              description <span className="text-[#1A0A00]/30 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. with guac and chips"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-coral-200 text-[#1A0A00]/70 font-medium rounded-xl text-base">
              cancel
            </button>
            <button
              type="submit"
              disabled={sending || !name.trim()}
              className="flex-1 py-3 bg-coral-400 text-white font-medium rounded-xl text-base disabled:opacity-50"
            >
              {sending ? '…' : 'suggest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
