import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getLocalDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type RatingRow = { score: number; user_id: string }
type VoteRow = { value: string; user_id: string }
type MealRow = {
  id: string
  name: string
  emoji: string | null
  scheduled_date: string
  ratings: RatingRow[]
  votes: VoteRow[]
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-coral-500'
  if (score >= 5) return 'text-amber-500'
  return 'text-[#1A0A00]/30'
}

function scoreEmoji(score: number): string {
  if (score >= 9) return '🤩'
  if (score >= 7) return '😊'
  if (score >= 5) return '😐'
  return '😬'
}

function barWidth(value: number, max: number): string {
  if (max === 0) return '0%'
  return `${Math.round((value / max) * 100)}%`
}

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role')
    .eq('id', userId)
    .single()

  if (!profile?.household_id) redirect('/onboard')

  const isPlanner = profile.role === 'planner'
  const today = getLocalDateString(0)
  const sixMonthsAgo = getLocalDateString(-180)

  const [mealsRes, profilesRes] = await Promise.all([
    supabase
      .from('meals')
      .select('id, name, emoji, scheduled_date, ratings(score, user_id), votes(value, user_id)')
      .eq('household_id', profile.household_id)
      .lt('scheduled_date', today)
      .gte('scheduled_date', sixMonthsAgo)
      .order('scheduled_date', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name')
      .eq('household_id', profile.household_id),
  ])

  const meals = (mealsRes.data ?? []) as MealRow[]
  const profiles = (profilesRes.data ?? []) as { id: string; name: string }[]

  // Top rated meals (need at least 1 rating)
  const topRated = meals
    .filter((m) => m.ratings.length > 0)
    .map((m) => ({
      ...m,
      avg: m.ratings.reduce((s, r) => s + r.score, 0) / m.ratings.length,
      count: m.ratings.length,
    }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 8)

  // Most loved by vote
  const mostLoved = meals
    .map((m) => ({
      ...m,
      loves: m.votes.filter((v) => v.value === 'love').length,
      total: m.votes.length,
    }))
    .filter((m) => m.loves > 0)
    .sort((a, b) => b.loves - a.loves || b.total - a.total)
    .slice(0, 5)

  const maxLoves = mostLoved[0]?.loves ?? 1

  // Per-person stats
  const perPerson = profiles.map((p) => {
    const myRatedMeals = meals
      .filter((m) => m.ratings.some((r) => r.user_id === p.id))
      .map((m) => ({
        ...m,
        myScore: m.ratings.find((r) => r.user_id === p.id)!.score,
      }))

    const avg =
      myRatedMeals.length > 0
        ? myRatedMeals.reduce((s, m) => s + m.myScore, 0) / myRatedMeals.length
        : null

    const top3 = [...myRatedMeals].sort((a, b) => b.myScore - a.myScore).slice(0, 3)
    const loveCount = meals.filter((m) =>
      m.votes.some((v) => v.user_id === p.id && v.value === 'love')
    ).length

    return { ...p, avg, top3, ratingCount: myRatedMeals.length, loveCount, isMe: p.id === userId }
  }).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  const isEmpty = meals.length === 0

  return (
    <div className="min-h-dvh bg-coral-50">
      <div className="sticky top-0 z-10 bg-coral-50/95 backdrop-blur-sm border-b border-coral-100">
        <div className="max-w-mobile mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/home"
            className="text-[#1A0A00]/40 flex items-center gap-1 text-sm active:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-[#1A0A00]">family insights</h1>
        </div>
      </div>

      <div className="max-w-mobile mx-auto px-4 pt-4 pb-10 space-y-6">
        {isEmpty ? (
          <div className="bg-white rounded-2xl border border-coral-100 px-6 py-12 text-center mt-4">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm text-[#1A0A00]/40">no meal history yet — ratings will show up here</p>
          </div>
        ) : (
          <>
            {/* Top Rated */}
            {topRated.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-coral-500 uppercase tracking-widest mb-3">top rated</p>
                <div className="space-y-2">
                  {topRated.map((meal, i) => (
                    <div key={meal.id} className="bg-white rounded-2xl border border-coral-100 px-4 py-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1A0A00]/20 w-5 text-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-2xl leading-none flex-shrink-0">{meal.emoji ?? '🍽️'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-[#1A0A00] truncate">{meal.name}</p>
                        <p className="text-sm text-[#1A0A00]/35 mt-0.5">
                          {meal.count} {meal.count === 1 ? 'rating' : 'ratings'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-lg leading-none">{scoreEmoji(meal.avg)}</span>
                        <span className={`text-base font-bold ${scoreColor(meal.avg)}`}>
                          {meal.avg.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Loved */}
            {mostLoved.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-coral-500 uppercase tracking-widest mb-3">most loved ❤️</p>
                <div className="bg-white rounded-2xl border border-coral-100 px-4 py-3 space-y-3">
                  {mostLoved.map((meal) => (
                    <div key={meal.id}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl leading-none flex-shrink-0">{meal.emoji ?? '🍽️'}</span>
                        <span className="text-sm font-medium text-[#1A0A00] truncate flex-1">{meal.name}</span>
                        <span className="text-sm text-[#1A0A00]/40 flex-shrink-0">{meal.loves} ❤️</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-coral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coral-400 transition-all"
                          style={{ width: barWidth(meal.loves, maxLoves) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Person */}
            <div>
              <p className="text-xs font-semibold text-coral-500 uppercase tracking-widest mb-3">by person</p>
              <div className="space-y-3">
                {perPerson.map((person) => (
                  <div key={person.id} className="bg-white rounded-2xl border border-coral-100 px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-coral-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {person.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span className="text-base font-semibold text-[#1A0A00]">
                          {person.name}{person.isMe ? ' (you)' : ''}
                        </span>
                      </div>
                      {person.avg !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{scoreEmoji(person.avg)}</span>
                          <span className={`text-base font-bold ${scoreColor(person.avg)}`}>
                            {person.avg.toFixed(1)} avg
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#1A0A00]/25">no ratings yet</span>
                      )}
                    </div>

                    {person.top3.length > 0 && (
                      <div className="space-y-1.5">
                        {person.top3.map((m) => (
                          <div key={m.id} className="flex items-center gap-2">
                            <span className="text-base leading-none">{m.emoji ?? '🍽️'}</span>
                            <span className="text-sm text-[#1A0A00]/70 flex-1 truncate">{m.name}</span>
                            <span className={`text-sm font-medium ${scoreColor(m.myScore)}`}>
                              {m.myScore}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 mt-3 pt-2 border-t border-coral-50">
                      <span className="text-xs text-[#1A0A00]/35">
                        {person.ratingCount} {person.ratingCount === 1 ? 'meal' : 'meals'} rated
                      </span>
                      <span className="text-xs text-[#1A0A00]/35">
                        {person.loveCount} ❤️ loves
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
