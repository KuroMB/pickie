'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SuggestionFooterProps {
  userId: string
  householdId: string
  onSent: () => void
}

export default function SuggestionFooter({ userId, householdId, onSent }: SuggestionFooterProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  async function send() {
    if (!text.trim()) return
    setSending(true)
    await supabase.from('suggestions').insert({
      household_id: householdId,
      submitted_by: userId,
      type: 'general',
      text: text.trim(),
    })
    setText('')
    setSending(false)
    onSent()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-coral-100 pb-safe">
      <div className="max-w-mobile mx-auto px-4 py-3 flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="suggest a dinner idea"
          className="flex-1 px-4 py-2.5 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="px-4 py-2.5 bg-coral-400 text-white text-sm font-medium rounded-xl disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
        >
          send
        </button>
      </div>
    </div>
  )
}
