import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getLocalDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type RatingRow = {
  score: number
  user_id: string
  rater: { id: string; name: string } | null
}

type PastMeal = {
  id: string
  name: string
  emoji: string | null
  scheduled_date: string
  description: string | null
  ratings: RatingRow[]
}

function formatHistoryDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatMonthGroup(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function scoreColor(score: number): string {
  if (score >= 8) return 'bg-coral-100 text-coral-500'
  if (score >= 5) return 'bg-amber-100 text-amber-600'
  return 'bg-[#1A0A00]/8 text-[#1A0A00]/40'
}

function scoreEmoji(score: number): string {
  if (score >= 9) return '🤩'
  if (score >= 7) return '😊'
  if (score >= 5) return '😐'
  return '😬'
}

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) redirect('/onboard')

  const today = getLocalDateString(0)

  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, emoji, scheduled_date, description, ratings(score, user_id, rater:profiles!user_id(id, name))')
    .eq('household_id', profile.household_id)
    .lt('scheduled_date', today)
    .order('scheduled_date', { ascending: false })
    .limit(90)

  const pastMeals = (meals ?? []) as unknown as PastMeal[]

  // Group by month
  const grouped: Record<string, PastMeal[]> = {}
  for (const meal of pastMeals) {
    const month = formatMonthGroup(meal.scheduled_date)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(meal)
  }

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
          <h1 className="text-base font-bold text-[#1A0A00]">meal history</h1>
        </div>
      </div>

      <div className="max-w-mobile mx-auto px-4 pt-4 pb-10">
        {pastMeals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-coral-100 px-6 py-12 text-center mt-4">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="text-sm text-[#1A0A00]/40">no past meals yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, monthMeals]) => (
            <div key={month} className="mb-6">
              <p className="text-xs font-semibold text-[#1A0A00]/40 uppercase tracking-widest mb-3">
                {month}
              </p>
              <div className="space-y-2">
                {monthMeals.map((meal) => (
                  <div key={meal.id} className="bg-white rounded-2xl border border-coral-100 px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl leading-none flex-shrink-0">{meal.emoji ?? '🍽️'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1A0A00] leading-tight truncate">
                          {meal.name}
                        </p>
                        <p className="text-[11px] text-[#1A0A00]/35 mt-0.5">
                          {formatHistoryDate(meal.scheduled_date)}
                        </p>
                      </div>
                    </div>

                    {meal.ratings.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {meal.ratings
                          .sort((a, b) => b.score - a.score)
                          .map((r) => (
                            <div
                              key={r.user_id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${scoreColor(r.score)}`}
                            >
                              <span>{scoreEmoji(r.score)}</span>
                              <span>{r.rater?.name ?? 'someone'}</span>
                              <span className="opacity-60">·</span>
                              <span>{r.score}/10</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#1A0A00]/25 mt-1">no ratings</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
