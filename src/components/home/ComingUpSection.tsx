'use client'

import MealCard from './MealCard'
import type { MealWithState, Profile } from '@/lib/types'
import { getLocalDateString } from '@/lib/utils'

interface ComingUpSectionProps {
  meals: MealWithState[]
  userId: string
  householdId: string
  isPlanner: boolean
  profiles: Profile[]
  onAddMeal: (date?: string) => void
  onUpdate: () => void
  onEditMeal: (meal: MealWithState) => void
}

function formatAgendaLabel(dateStr: string): string {
  const tomorrow = getLocalDateString(1)
  if (dateStr === tomorrow) return 'tomorrow'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}

function formatAgendaShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ComingUpSection({
  meals,
  userId,
  householdId,
  isPlanner,
  onAddMeal,
  onUpdate,
  onEditMeal,
}: ComingUpSectionProps) {
  // Always show the next 7 days (planners); plus any meal dates beyond that window
  const windowDates = Array.from({ length: 7 }, (_, i) => getLocalDateString(i + 1))
  const mealDates = meals.map((m) => m.scheduled_date)
  const allDates = Array.from(new Set([...windowDates, ...mealDates])).sort()

  // Members only see dates that have meals
  const visibleDates = isPlanner ? allDates : allDates.filter((d) => mealDates.includes(d))

  const mealsByDate = meals.reduce<Record<string, MealWithState[]>>((acc, m) => {
    if (!acc[m.scheduled_date]) acc[m.scheduled_date] = []
    acc[m.scheduled_date].push(m)
    return acc
  }, {})

  if (visibleDates.length === 0) {
    return (
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest mb-3">coming up</p>
        <div className="bg-coral-50 rounded-2xl px-4 py-8 text-center border border-coral-100">
          <p className="text-sm text-[#1A0A00]/40">nothing planned yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest">coming up</p>
        {isPlanner && (
          <button
            onClick={() => onAddMeal()}
            className="flex items-center gap-1 text-xs font-medium text-coral-400 bg-coral-100 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            add meal
          </button>
        )}
      </div>

      {visibleDates.map((dateStr) => {
        const dayMeals = mealsByDate[dateStr] ?? []
        return (
          <div key={dateStr}>
            <div className="flex items-center gap-2 py-2">
              <div className="h-px flex-1 bg-coral-100" />
              <span className="text-[11px] font-medium text-[#1A0A00]/35 uppercase tracking-widest whitespace-nowrap">
                {formatAgendaLabel(dateStr)} · {formatAgendaShortDate(dateStr)}
              </span>
              <div className="h-px flex-1 bg-coral-100" />
              {isPlanner && (
                <button
                  onClick={() => onAddMeal(dateStr)}
                  aria-label={`add meal on ${dateStr}`}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-100 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-3 h-3 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>

            {dayMeals.length > 0 && (
              <div className="space-y-2 mb-1">
                {dayMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    userId={userId}
                    householdId={householdId}
                    isPlanner={isPlanner}
                    onUpdate={onUpdate}
                    onEdit={onEditMeal}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
