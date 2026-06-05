import type { Meal, MealState, MealWithState, Vote, Rating, VoteValue } from './types'

export function getLocalDateString(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

export function getMealState(
  scheduledDate: string,
  userRating: number | null | undefined
): MealState {
  const today = getLocalDateString(0)
  const tomorrow = getLocalDateString(1)
  const yesterday = getLocalDateString(-1)

  if (scheduledDate === today) return 'tonight'
  if (scheduledDate === tomorrow) return 'tomorrow'
  if (scheduledDate === yesterday) {
    return userRating != null ? 'archived' : 'lastnight'
  }
  if (scheduledDate < today) return 'archived'
  return 'upcoming'
}

export function enrichMeal(
  meal: Meal,
  userId: string
): MealWithState {
  const myRating = meal.ratings?.find((r) => r.user_id === userId)?.score ?? null
  const myVote = meal.votes?.find((v) => v.user_id === userId)?.value ?? null
  const state = getMealState(meal.scheduled_date, myRating)

  const voteTally = { love: 0, meh: 0, nope: 0 }
  meal.votes?.forEach((v) => {
    voteTally[v.value]++
  })

  return { ...meal, state, myVote, myRating, voteTally }
}

export function formatCookTime(minutes: number | null): string {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function formatShortDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export const VOTE_EMOJI: Record<VoteValue, string> = {
  love: '😍',
  meh: '😐',
  nope: '😑',
}

export const VOTE_LABEL: Record<VoteValue, string> = {
  love: 'love it',
  meh: "it's fine",
  nope: 'rather not',
}

export const DEFAULT_TASK_LABELS = [
  'cooking dinner',
  'setting the table',
  'clearing up',
]
