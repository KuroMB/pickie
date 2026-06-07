import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notifyAndPush } from '@/lib/push'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'planner') return NextResponse.json({ error: 'planners only' }, { status: 403 })

  const { suggestionId, action } = await request.json()
  if (!suggestionId || !['approve', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'invalid params' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: suggestion } = await service
    .from('suggestions')
    .select('*, submitter:profiles!submitted_by(id, name, household_id)')
    .eq('id', suggestionId)
    .single()

  if (!suggestion) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (action === 'approve') {
    const { data: meal } = await service
      .from('meals')
      .insert({
        household_id: profile.household_id,
        name: suggestion.text,
        emoji: suggestion.suggested_emoji ?? null,
        description: suggestion.suggested_description ?? null,
        scheduled_date: suggestion.suggested_date,
        cook_time_minutes: suggestion.suggested_cook_time_minutes ?? null,
        created_by: user.id,
      })
      .select()
      .single()

    if (meal) {
      await service
        .from('tasks')
        .insert([
          { meal_id: meal.id, household_id: profile.household_id, label: 'cooking dinner' },
          { meal_id: meal.id, household_id: profile.household_id, label: 'setting the table' },
          { meal_id: meal.id, household_id: profile.household_id, label: 'clearing up' },
        ])
    }

    await service
      .from('suggestions')
      .update({ status: 'added' })
      .eq('id', suggestionId)

    await notifyAndPush({
      userId: suggestion.submitted_by,
      householdId: profile.household_id!,
      type: 'suggestion_approved',
      title: '✅ Your suggestion was approved!',
      body: `${suggestion.text} is on the menu${suggestion.suggested_date ? ` for ${new Date(suggestion.suggested_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` : ''}.`,
      url: '/home',
    })
  } else {
    await service
      .from('suggestions')
      .update({ status: 'declined', declined_at: new Date().toISOString() })
      .eq('id', suggestionId)

    await notifyAndPush({
      userId: suggestion.submitted_by,
      householdId: profile.household_id!,
      type: 'suggestion_declined',
      title: 'Suggestion passed on',
      body: `${suggestion.text} wasn't added this time. Keep the ideas coming!`,
      url: '/home',
    })
  }

  return NextResponse.json({ ok: true })
}
