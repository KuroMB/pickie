import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendAdHocPollEmail } from '@/lib/resend'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'planner') {
    return NextResponse.json({ error: 'planners only' }, { status: 403 })
  }

  const { question, optionA, optionB } = await request.json()
  if (!question || !optionA || !optionB) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: members } = await service
    .from('profiles')
    .select('name, email')
    .eq('household_id', profile.household_id)

  if (!members || members.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const pollId = crypto.randomUUID()
  await sendAdHocPollEmail(members, question, optionA, optionB, pollId)

  await service.from('notification_log').insert({
    household_id: profile.household_id,
    type: 'ad_hoc_poll',
    recipient_count: members.length,
  })

  return NextResponse.json({ sent: members.length })
}
