'use client'

import { useState } from 'react'
import TaskItem from '@/components/ui/TaskItem'
import { createClient } from '@/lib/supabase/client'
import { formatCookTime } from '@/lib/utils'
import type { MealWithState, Profile } from '@/lib/types'

interface TonightHeroCardProps {
  meal: MealWithState
  profiles: Profile[]
  userId: string
  isPlanner: boolean
  onUpdate: () => void
  onEdit: (meal: MealWithState) => void
}

export default function TonightHeroCard({ meal, profiles, userId, isPlanner, onUpdate, onEdit }: TonightHeroCardProps) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  async function claimTask(taskId: string) {
    setClaiming(taskId)
    await supabase.from('tasks').update({ claimed_by: userId }).eq('id', taskId)
    setClaiming(null)
    onUpdate()
  }

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    setDeleting(true)
    await supabase.rpc('delete_meal', { p_meal_id: meal.id })
    onUpdate()
  }

  function getClaimerName(claimedBy: string | null) {
    if (!claimedBy) return undefined
    return profiles.find((p) => p.id === claimedBy)?.name
  }

  return (
    <div className="mx-4 mb-4">
      <div className="bg-coral-400 rounded-3xl px-6 py-8 text-white shadow-md relative">
        {isPlanner && (
          <div className="absolute top-4 right-4 flex gap-1.5">
            <button
              onClick={() => onEdit(meal)}
              className="text-[10px] font-medium text-white/60 px-2.5 py-1 rounded-full border border-white/20 active:scale-95 transition-transform"
            >
              edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                deleteConfirm
                  ? 'text-white bg-red-500 border-red-500'
                  : 'text-white/60 border-white/20'
              }`}
            >
              {deleting ? '…' : deleteConfirm ? 'confirm?' : 'delete'}
            </button>
          </div>
        )}

        <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-3">tonight</p>
        <div className="flex items-start gap-3 mb-1">
          <span className="text-5xl leading-none">{meal.emoji ?? '🍽️'}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-tight">{meal.name}</h2>
            {meal.description && (
              <p className="text-sm text-white/70 mt-1 leading-snug">{meal.description}</p>
            )}
            {meal.cook_time_minutes && (
              <p className="text-xs text-white/50 mt-2">⏱ {formatCookTime(meal.cook_time_minutes)}</p>
            )}
          </div>
        </div>

        {meal.tasks && meal.tasks.length > 0 && (
          <div className="mt-6 bg-white/15 rounded-2xl px-4 py-1 divide-y divide-white/10">
            {meal.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                claimerName={getClaimerName(task.claimed_by)}
                currentUserId={userId}
                canClaim={!task.claimed_by && claiming !== task.id}
                onClaim={claimTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
