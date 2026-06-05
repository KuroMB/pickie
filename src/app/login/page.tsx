'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter() // still used for signup redirect

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        router.push('/onboard')
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Sign in failed')
        window.location.href = '/'
      }
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
        <p className="text-sm text-[#1A0A00]/60 mb-8">family dinner planning, together</p>

        <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6">
          <div className="flex rounded-xl bg-coral-100 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-coral-400 shadow-sm'
                  : 'text-[#1A0A00]/60'
              }`}
            >
              sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-coral-400 shadow-sm'
                  : 'text-[#1A0A00]/60'
              }`}
            >
              create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
                  your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="first name is fine"
                  className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A0A00]/60 mb-1.5">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="min 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-coral-200 bg-coral-50 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/30 focus:border-coral-400 placeholder:text-[#1A0A00]/30"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {loading ? '…' : mode === 'login' ? 'sign in' : 'create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
