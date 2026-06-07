'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { enrichMeal } from '@/lib/utils'
import LastNightStrip from './LastNightStrip'
import TonightHeroCard from './TonightHeroCard'
import ComingUpSection from './ComingUpSection'
import SuggestionInbox from './SuggestionInbox'
import SuggestionFooter from './SuggestionFooter'
import PollCard from './PollCard'
import AddMealModal from '@/components/planner/AddMealModal'
import AdHocPollModal from '@/components/planner/AdHocPollModal'
import SideDrawer from './SideDrawer'
import type { Profile, Meal, Suggestion, MealWithState, Poll } from '@/lib/types'
import { getLocalDateString } from '@/lib/utils'

interface HomeFeedProps {
  initialProfile: Profile
  initialMeals: Meal[]
  initialSuggestions: Suggestion[]
  initialProfiles: Profile[]
  initialPolls: Poll[]
}

export default function HomeFeed({
  initialProfile,
  initialMeals,
  initialSuggestions,
  initialProfiles,
  initialPolls,
}: HomeFeedProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [addMealDate, setAddMealDate] = useState<string | undefined>(undefined)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [showPoll, setShowPoll] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const supabase = createClient()

  const profile = initialProfile
  const isPlanner = profile.role === 'planner'
  const householdId = profile.household_id!

  const reload = useCallback(async () => {
    const today = getLocalDateString(0)
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

    if (mealsRes.data) setMeals(mealsRes.data as Meal[])
    if (suggestionsRes.data) setSuggestions(suggestionsRes.data as Suggestion[])
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[])
    if (pollsRes.data) setPolls(pollsRes.data as Poll[])
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `household_id=eq.${householdId}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_responses', filter: `household_id=eq.${householdId}` }, reload)
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
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-3xl font-bold text-coral-300 tracking-tight">pickie.</span>
            <span className="text-2xl font-medium text-coral-300/70 tracking-tight">eating. simplified.</span>
          </div>
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
            isPlanner={isPlanner}
            onUpdate={reload}
            onEdit={setEditingMeal}
          />
        ) : tomorrowMeal ? (
          <TonightHeroCard
            meal={tomorrowMeal}
            profiles={profiles}
            userId={profile.id}
            isPlanner={isPlanner}
            onUpdate={reload}
            onEdit={setEditingMeal}
          />
        ) : (
          <div className="mx-4 mb-4">
            <div className="bg-coral-100 rounded-3xl px-6 py-10 text-center">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-sm text-[#1A0A00]/50">nothing scheduled for tonight</p>
            </div>
          </div>
        )}

        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            userId={profile.id}
            householdId={householdId}
            isPlanner={isPlanner}
            onUpdate={reload}
          />
        ))}

        <ComingUpSection
          meals={upcomingMeals}
          userId={profile.id}
          householdId={householdId}
          isPlanner={isPlanner}
          profiles={profiles}
          onAddMeal={(date) => { setAddMealDate(date); setShowAddMeal(true) }}
          onUpdate={reload}
          onEditMeal={setEditingMeal}
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
          initialDate={addMealDate}
          onClose={() => { setShowAddMeal(false); setAddMealDate(undefined) }}
          onAdded={reload}
        />
      )}

      {editingMeal && (
        <AddMealModal
          householdId={householdId}
          userId={profile.id}
          editMeal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onAdded={() => { reload(); setEditingMeal(null) }}
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
