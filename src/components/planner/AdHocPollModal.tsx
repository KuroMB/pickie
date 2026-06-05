'use client'

import { useState } from 'react'

interface AdHocPollModalProps {
  onClose: () => void
}

export default function AdHocPollModal({ onClose }: AdHocPollModalProps) {
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || !optionA.trim() || !optionB.trim()) return
    setSending(true)
    const res = await fetch('/api/notifications/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
      }),
    })
    setSending(false)
    if (res.ok) setSent(true)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="w-full max-w-mobile bg-white rounded-t-3xl px-5 pt-5 pb-safe">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">send a poll</h2>
          <button onClick={onClose} className="text-[#1A0A00]/40 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">📨</p>
            <p className="font-medium text-[#1A0A00]/80">poll sent!</p>
            <p className="text-sm text-[#1A0A00]/40 mt-1">everyone got an email</p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm"
            >
              done
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                placeholder="e.g. pizza or chinese tonight?"
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  required
                  placeholder="pizza"
                  className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  required
                  placeholder="chinese"
                  className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-coral-200 text-[#1A0A00]/70 font-medium rounded-xl text-sm"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50"
              >
                {sending ? 'sending…' : 'send poll'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
