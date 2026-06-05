import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendRatingReminderEmail } from '@/lib/resend'
import { getLocalDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const yesterday = getLocalDateString(-1)

  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, emoji, household_id')
    .eq('scheduled_date', yesterday)

  if (!meals || meals.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let totalSent = 0

  for (const meal of meals) {
    const { data: ratings } = await supabase
      .from('ratings')
      .select('user_id')
      .eq('meal_id', meal.id)

    const ratedUserIds = new Set((ratings ?? []).map((r) => r.user_id))

    const { data: members } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('household_id', meal.household_id)

    if (!members) continue

    const unrated = members.filter((m) => !ratedUserIds.has(m.id))

    await Promise.allSettled(
      unrated.map((member) =>
        sendRatingReminderEmail(
          { name: member.name, email: member.email },
          { name: meal.name, emoji: meal.emoji }
        )
      )
    )

    if (unrated.length > 0) {
      await supabase.from('notification_log').insert({
        household_id: meal.household_id,
        type: 'rating_reminder',
        recipient_count: unrated.length,
      })
    }

    totalSent += unrated.length
  }

  return NextResponse.json({ sent: totalSent })
}
