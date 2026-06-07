export type Role = 'planner' | 'member'
export type MealType = 'dinner' | 'breakfast' | 'lunch'
export type VoteValue = 'love' | 'meh' | 'nope'
export type SuggestionType = 'remix' | 'general'
export type SuggestionStatus = 'open' | 'noted' | 'added'
export type NotificationType = 'new_meal' | 'rating_reminder' | 'ad_hoc_poll'
export type MealState = 'upcoming' | 'tomorrow' | 'tonight' | 'lastnight' | 'archived'

export interface Household {
  id: string
  name: string
  created_at: string
  invite_code: string
  planner_invite_code: string
}

export interface Profile {
  id: string
  household_id: string | null
  name: string
  email: string
  role: Role
  notification_preference: 'email'
  created_at: string
  household?: Household
}

export interface Meal {
  id: string
  household_id: string
  name: string
  description: string | null
  emoji: string | null
  scheduled_date: string
  meal_type: MealType
  cook_time_minutes: number | null
  locked: boolean
  created_by: string | null
  created_at: string
  tasks?: Task[]
  votes?: Vote[]
  ratings?: Rating[]
}

export interface Task {
  id: string
  meal_id: string
  household_id: string
  label: string
  claimed_by: string | null
  created_at: string
  claimer?: Profile
}

export interface Vote {
  id: string
  meal_id: string
  user_id: string
  household_id: string
  value: VoteValue
  created_at: string
  voter?: Profile
}

export interface Rating {
  id: string
  meal_id: string
  user_id: string
  household_id: string
  score: number
  created_at: string
}

export interface Suggestion {
  id: string
  meal_id: string | null
  household_id: string
  submitted_by: string
  type: SuggestionType
  text: string
  status: SuggestionStatus
  upvotes: number
  created_at: string
  submitter?: Profile
  meal?: Meal | null
  hasUpvoted?: boolean
}

export interface SuggestionUpvote {
  id: string
  suggestion_id: string
  user_id: string
  created_at: string
}

export interface NotificationLog {
  id: string
  household_id: string
  type: NotificationType
  sent_at: string
  recipient_count: number
}

export interface MealWithState extends Meal {
  state: MealState
  myVote?: VoteValue | null
  myRating?: number | null
  voteTally: { love: number; meh: number; nope: number }
}

export interface Poll {
  id: string
  household_id: string
  created_by: string
  question: string
  option_a: string
  option_b: string
  closed: boolean
  created_at: string
  responses?: PollResponse[]
}

export interface PollResponse {
  id: string
  poll_id: string
  user_id: string
  household_id: string
  choice: 'a' | 'b'
  created_at: string
}
