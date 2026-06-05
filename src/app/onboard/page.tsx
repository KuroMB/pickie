'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardPage() {
  const [mode, setMode] = useState<'create' | 'join'>('join')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [role, setRole] = useState<'planner' | 'member'>('member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { data: household, error: hErr } = await supabase
        .from('households')
        .insert({ name: householdName })
        .select()
        .single()
      if (hErr) throw hErr

      const { error: pErr } = await supabase
        .from('profiles')
        .update({ household_id: household.id, role })
        .eq('id', user.id)
      if (pErr) throw pErr

      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { data: household, error: hErr } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase().trim())
        .single()
      if (hErr || !household) throw new Error('Invite code not found')

      const { error: pErr } = await supabase
        .from('profiles')
        .update({ household_id: household.id, role: 'member' })
        .eq('id', user.id)
      if (pErr) throw pErr

      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
        <p className="text-sm text-[#1A0A00]/60 mb-8">let's get you set up</p>

        <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6">
          <div className="flex rounded-xl bg-coral-100 p-1 mb-6">
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'join' ? 'bg-white text-coral-400 shadow-sm' : 'text-[#1A0A00]/60'
              }`}
            >
              join household
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'create' ? 'bg-white text-coral-400 shadow-sm' : 'text-[#1A0A00]/60'
              }`}
            >
              create new
            </button>
          </div>

          {mode === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
                  invite code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  placeholder="e.g. A3F7K2"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm font-medium tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:normal-case placeholder:tracking-normal"
                />
                <p className="text-xs text-[#1A0A00]/40 mt-1.5">ask your household planner for the code</p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {loading ? '…' : 'join household'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
                  household name
                </label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                  placeholder="e.g. The Black Family"
                  className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
                  your role
                </label>
                <div className="flex gap-3">
                  {(['planner', 'member'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        role === r
                          ? 'bg-coral-400 text-white border-coral-400'
                          : 'bg-coral-50 text-[#1A0A00]/70 border-coral-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {loading ? '…' : 'create household'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
