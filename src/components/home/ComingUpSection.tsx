'use client'

import MealCard from './MealCard'
import type { MealWithState, Profile } from '@/lib/types'

interface ComingUpSectionProps {
  meals: MealWithState[]
  userId: string
  householdId: string
  isPlanner: boolean
  profiles: Profile[]
  onAddMeal: () => void
  onUpdate: () => void
}

export default function ComingUpSection({
  meals,
  userId,
  householdId,
  isPlanner,
  onAddMeal,
  onUpdate,
}: ComingUpSectionProps) {
  if (meals.length === 0 && !isPlanner) {
    return (
      <div className="mx-4 mb-4">
        <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest mb-3">
          coming up
        </p>
        <div className="bg-coral-50 rounded-2xl px-4 py-8 text-center border border-coral-100">
          <p className="text-sm text-[#1A0A00]/40">nothing planned yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#1A0A00]/40 uppercase tracking-widest">
          coming up
        </p>
        {isPlanner && (
          <button
            onClick={onAddMeal}
            className="flex items-center gap-1 text-xs font-medium text-coral-400 bg-coral-100 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            add meal
          </button>
        )}
      </div>

      <div className="space-y-2">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            userId={userId}
            householdId={householdId}
            isPlanner={isPlanner}
            onUpdate={onUpdate}
          />
        ))}
        {meals.length === 0 && (
          <div className="bg-coral-50 rounded-2xl px-4 py-8 text-center border border-dashed border-coral-200">
            <p className="text-sm text-[#1A0A00]/40 mb-2">nothing on the menu yet</p>
            <button
              onClick={onAddMeal}
              className="text-sm font-medium text-coral-400"
            >
              add the first meal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
