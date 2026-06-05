'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardPage() {
  const [householdName, setHouseholdName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
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
        .update({ household_id: household.id, role: 'planner' })
        .eq('id', user.id)
      if (pErr) throw pErr

      router.refresh()
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
