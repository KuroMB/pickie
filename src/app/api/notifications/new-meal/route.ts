import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendNewMealEmail } from '@/lib/resend'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { mealId } = await request.json()
  if (!mealId) return NextResponse.json({ error: 'missing mealId' }, { status: 400 })

  const service = createServiceClient()

  const { data: meal } = await service
    .from('meals')
    .select('id, name, emoji, scheduled_date, household_id, households(name)')
    .eq('id', mealId)
    .single()

  if (!meal) return NextResponse.json({ error: 'meal not found' }, { status: 404 })

  const { data: members } = await service
    .from('profiles')
    .select('name, email')
    .eq('household_id', meal.household_id)
    .neq('id', user.id)

  if (members && members.length > 0) {
    const householdName = (meal.households as unknown as { name: string } | null)?.name ?? 'your household'
    await sendNewMealEmail(members, meal, householdName)
    await service.from('notification_log').insert({
      household_id: meal.household_id,
      type: 'new_meal',
      recipient_count: members.length,
    })
  }

  return NextResponse.json({ sent: members?.length ?? 0 })
}
