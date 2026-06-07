import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) return NextResponse.json({ error: 'no household' }, { status: 400 })

  const { subscription } = await request.json()
  if (!subscription?.endpoint) return NextResponse.json({ error: 'invalid subscription' }, { status: 400 })

  const service = createServiceClient()
  await service
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        household_id: profile.household_id,
        endpoint: subscription.endpoint,
        subscription,
      },
      { onConflict: 'user_id,endpoint' }
    )

  return NextResponse.json({ ok: true })
}
