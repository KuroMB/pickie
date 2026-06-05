'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { enrichMeal } from '@/lib/utils'
import LastNightStrip from './LastNightStrip'
import TonightHeroCard from './TonightHeroCard'
import ComingUpSection from './ComingUpSection'
import SuggestionInbox from './SuggestionInbox'
import SuggestionFooter from './SuggestionFooter'
import AddMealModal from '@/components/planner/AddMealModal'
import AdHocPollModal from '@/components/planner/AdHocPollModal'
import SideDrawer from './SideDrawer'
import type { Profile, Meal, Suggestion, MealWithState } from '@/lib/types'
import { getLocalDateString } from '@/lib/utils'

interface HomeFeedProps {
  initialProfile: Profile
  initialMeals: Meal[]
  initialSuggestions: Suggestion[]
  initialProfiles: Profile[]
}

export default function HomeFeed({
  initialProfile,
  initialMeals,
  initialSuggestions,
  initialProfiles,
}: HomeFeedProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showPoll, setShowPoll] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const supabase = createClient()

  const profile = initialProfile
  const isPlanner = profile.role === 'planner'
  const householdId = profile.household_id!

  const reload = useCallback(async () => {
    const today = getLocalDateString(0)
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

    if (mealsRes.data) setMeals(mealsRes.data as Meal[])
    if (suggestionsRes.data) setSuggestions(suggestionsRes.data as Suggestion[])
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[])
  }, [supabase, householdId])

  // real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('home-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `household_id=eq.${householdId}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `household_id=eq.${householdId}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions', filter: `household_id=eq.${householdId}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals', filter: `household_id=eq.${householdId}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings', filter: `household_id=eq.${householdId}` }, reload)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, householdId, reload])

  const enriched: MealWithState[] = meals.map((m) => enrichMeal(m, profile.id))

  const lastNightMeal = enriched.find((m) => m.state === 'lastnight')
  const tonightMeal = enriched.find((m) => m.state === 'tonight')
  const tomorrowMeal = enriched.find((m) => m.state === 'tomorrow')
  const upcomingMeals = enriched.filter((m) => m.state === 'upcoming' || m.state === 'tomorrow')

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-dvh bg-coral-50">
      {/* header */}
      <div className="sticky top-0 z-10 bg-coral-50/95 backdrop-blur-sm border-b border-coral-100">
        <div className="max-w-mobile mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coral-400 tracking-tight">pickie</h1>
          <div className="flex items-center gap-2">
            {isPlanner && (
              <button
                onClick={() => setShowPoll(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-coral-400 bg-coral-100 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
              >
                <span>📨</span> poll
              </button>
            )}
            <button
              onClick={() => setShowDrawer(true)}
              aria-label="menu"
              className="w-8 h-8 rounded-full bg-coral-400 flex items-center justify-center text-white text-sm font-bold active:scale-95 transition-transform"
            >
              {profile.name?.charAt(0).toUpperCase() ?? '?'}
            </button>
          </div>
        </div>
      </div>

      {/* scrollable content */}
      <div className="max-w-mobile mx-auto pt-4 pb-28">
        {lastNightMeal && (
          <LastNightStrip
            meal={lastNightMeal}
            userId={profile.id}
            householdId={householdId}
            onRated={reload}
          />
        )}

        {tonightMeal ? (
          <TonightHeroCard
            meal={tonightMeal}
            profiles={profiles}
            userId={profile.id}
            onUpdate={reload}
          />
        ) : tomorrowMeal ? (
          <TonightHeroCard
            meal={tomorrowMeal}
            profiles={profiles}
            userId={profile.id}
            onUpdate={reload}
          />
        ) : (
          <div className="mx-4 mb-4">
            <div className="bg-coral-100 rounded-3xl px-6 py-10 text-center">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-sm text-[#1A0A00]/50">nothing scheduled for tonight</p>
            </div>
          </div>
        )}

        <ComingUpSection
          meals={upcomingMeals}
          userId={profile.id}
          householdId={householdId}
          isPlanner={isPlanner}
          profiles={profiles}
          onAddMeal={() => setShowAddMeal(true)}
          onUpdate={reload}
        />

        <SuggestionInbox
          suggestions={suggestions}
          isPlanner={isPlanner}
          onUpdate={reload}
        />
      </div>

      <SuggestionFooter
        userId={profile.id}
        householdId={householdId}
        onSent={reload}
      />

      {showAddMeal && (
        <AddMealModal
          householdId={householdId}
          userId={profile.id}
          onClose={() => setShowAddMeal(false)}
          onAdded={reload}
        />
      )}

      {showPoll && <AdHocPollModal onClose={() => setShowPoll(false)} />}

      {showDrawer && (
        <SideDrawer
          profile={profile}
          onClose={() => setShowDrawer(false)}
          onSignOut={signOut}
        />
      )}
    </div>
  )
}
