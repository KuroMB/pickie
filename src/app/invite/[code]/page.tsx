import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Role } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase().trim()
  const service = createServiceClient()

  // Which code was used determines the role — no client-supplied param
  const [memberRes, plannerRes] = await Promise.all([
    service.from('households').select('id, name').eq('invite_code', code).maybeSingle(),
    service.from('households').select('id, name').eq('planner_invite_code', code).maybeSingle(),
  ])

  const household = memberRes.data ?? plannerRes.data
  const role: Role = plannerRes.data ? 'planner' : 'member'

  if (!household) {
    redirect('/login?error=invalid_invite')
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single()

    if (!profile?.household_id) {
      await supabase.rpc('join_household_with_code', { p_code: code })
    }

    redirect('/home')
  }

  const roleLabel = role === 'planner' ? 'planner (full edit access)' : 'member'

  return (
    <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
        <p className="text-sm text-[#1A0A00]/60 mb-8">family dinner planning, together</p>

        <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6 text-center">
          <p className="text-sm text-[#1A0A00]/50 mb-1">you've been invited to join</p>
          <p className="text-2xl font-bold text-[#1A0A00] mb-1">{household.name}</p>
          <p className="text-xs text-[#1A0A00]/40 mb-6">as a {roleLabel}</p>
          <Link
            href={`/login?next=${encodeURIComponent(`/invite/${code}`)}`}
            className="block w-full py-3 bg-coral-400 text-white font-medium rounded-xl text-sm"
          >
            sign in to join
          </Link>
          <p className="text-xs text-[#1A0A00]/40 mt-3">
            new to pickie? create an account on the next screen
          </p>
        </div>
      </div>
    </div>
  )
}
