'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'choose' | 'create' | 'join'

export default function OnboardPage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [householdName, setHouseholdName] = useState('')
  const [inviteInput, setInviteInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('create_household_and_join', { p_name: householdName })
      if (error) throw error
      router.refresh()
      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // Accept either a full URL or just the code
    const trimmed = inviteInput.trim()
    const match = trimmed.match(/\/invite\/([A-Z0-9]+)/i) ?? trimmed.match(/^([A-Z0-9]{4,})$/i)
    const code = match?.[1] ?? trimmed
    if (!code) { setError('Paste your invite link or enter the invite code'); return }
    router.push(`/invite/${code.toUpperCase()}`)
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
          <p className="text-sm text-[#1A0A00]/60 mb-8">what would you like to do?</p>

          <div className="space-y-3">
            <button
              onClick={() => setMode('join')}
              className="w-full bg-coral-400 text-white font-medium rounded-2xl px-6 py-4 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-sm font-semibold">join a family</p>
              <p className="text-xs text-white/70 mt-0.5">I have an invite link from my planner</p>
            </button>

            <button
              onClick={() => setMode('create')}
              className="w-full bg-white border border-coral-200 rounded-2xl px-6 py-4 text-left active:scale-[0.98] transition-transform"
            >
              <p className="text-sm font-semibold text-[#1A0A00]">create a new family</p>
              <p className="text-xs text-[#1A0A00]/50 mt-0.5">I'm setting up pickie for my household</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button onClick={() => setMode('choose')} className="text-sm text-[#1A0A00]/40 mb-6 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            back
          </button>

          <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
          <p className="text-sm text-[#1A0A00]/60 mb-8">paste your invite link to join</p>

          <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6">
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                required
                placeholder="paste invite link or code…"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
              />

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !inviteInput.trim()}
                className="w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {loading ? '…' : 'join family'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => setMode('choose')} className="text-sm text-[#1A0A00]/40 mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          back
        </button>

        <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
        <p className="text-sm text-[#1A0A00]/60 mb-8">let's get you set up</p>

        <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6">
          <p className="text-sm font-medium text-[#1A0A00] mb-4">what's your family called?</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              required
              placeholder="e.g. The Johnson Family"
              className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {loading ? '…' : 'create my family'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
