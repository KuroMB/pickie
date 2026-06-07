import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeFeed from '@/components/home/HomeFeed'
import type { Meal, Suggestion, Profile } from '@/lib/types'
import { getLocalDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()

  // getSession reads from cookies (no network call) — middleware already
  // validated the session, so this is safe and saves one round-trip to Supabase.
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, household:households(*)')
    .eq('id', userId)
    .single()

  if (!profile?.household_id) redirect('/onboard')

  const householdId = profile.household_id
  const yesterday = getLocalDateString(-1)

  const [mealsRes, suggestionsRes, profilesRes] = await Promise.all([
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
  ])

  return (
    <HomeFeed
      initialProfile={profile as Profile}
      initialMeals={(mealsRes.data ?? []) as Meal[]}
      initialSuggestions={(suggestionsRes.data ?? []) as Suggestion[]}
      initialProfiles={(profilesRes.data ?? []) as Profile[]}
    />
  )
}
