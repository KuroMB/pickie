import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeFeed from '@/components/home/HomeFeed'
import type { Meal, Suggestion, Profile, Poll } from '@/lib/types'
import { getLocalDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, household:households(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) redirect('/onboard')

  const householdId = profile.household_id
  const yesterday = getLocalDateString(-1)

  const [mealsRes, suggestionsRes, profilesRes, pollsRes] = await Promise.all([
    supabase
      .from('meals')
      .select('*, tasks(*), votes(*), ratings(*)')
      .eq('household_id', householdId)
      .gte('scheduled_date', yesterday)
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('suggestions')
      .select('*, submitter:profiles!submitted_by(id,name), meal:meals(id,name)')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('household_id', householdId),
    supabase
      .from('polls')
      .select('*, responses:poll_responses(*)')
      .eq('household_id', householdId)
      .eq('closed', false)
      .order('created_at', { ascending: false }),
  ])

  return (
    <HomeFeed
      initialProfile={profile as Profile}
      initialMeals={(mealsRes.data ?? []) as Meal[]}
      initialSuggestions={(suggestionsRes.data ?? []) as Suggestion[]}
      initialProfiles={(profilesRes.data ?? []) as Profile[]}
      initialPolls={(pollsRes.data ?? []) as Poll[]}
    />
  )
}
