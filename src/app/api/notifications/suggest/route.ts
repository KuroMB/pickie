import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notifyAndPush } from '@/lib/push'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, name')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) return NextResponse.json({ error: 'no household' }, { status: 400 })

  const { mealName, suggestedDate } = await request.json()

  const service = createServiceClient()

  // Notify all planners in the household
  const { data: planners } = await service
    .from('profiles')
    .select('id, household_id')
    .eq('household_id', profile.household_id)
    .eq('role', 'planner')
    .neq('id', user.id)

  const dateLabel = suggestedDate
    ? new Date(suggestedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : null

  await Promise.all(
    (planners ?? []).map((planner) =>
      notifyAndPush({
        userId: planner.id,
        householdId: planner.household_id,
        type: 'suggestion_submitted',
        title: `💡 ${profile.name} suggested a meal`,
        body: `${mealName}${dateLabel ? ` for ${dateLabel}` : ''}`,
        url: '/home',
      })
    )
  )

  return NextResponse.json({ ok: true })
}
