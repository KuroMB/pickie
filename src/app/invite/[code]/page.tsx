import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase().trim()

  // Use service client so RLS doesn't block the household lookup
  const service = createServiceClient()
  const { data: household } = await service
    .from('households')
    .select('id, name')
    .eq('invite_code', code)
    .single()

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
      await supabase
        .from('profiles')
        .update({ household_id: household.id, role: 'member' })
        .eq('id', user.id)
    }

    redirect('/home')
  }

  // Not signed in — show landing page
  return (
    <div className="min-h-dvh bg-coral-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-coral-400 mb-2 tracking-tight">pickie</h1>
        <p className="text-sm text-[#1A0A00]/60 mb-8">family dinner planning, together</p>

        <div className="bg-white rounded-2xl shadow-sm border border-coral-100 p-6 text-center">
          <p className="text-sm text-[#1A0A00]/50 mb-1">you've been invited to join</p>
          <p className="text-2xl font-bold text-[#1A0A00] mb-6">{household.name}</p>
          <Link
            href={`/login?next=/invite/${code}`}
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
