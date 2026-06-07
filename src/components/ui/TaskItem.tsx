'use client'

import type { Task } from '@/lib/types'

interface TaskItemProps {
  task: Task
  claimerName?: string
  currentUserId: string
  onClaim: (taskId: string) => void
  canClaim: boolean
}

export default function TaskItem({ task, claimerName, currentUserId, onClaim, canClaim }: TaskItemProps) {
  const isMine = task.claimed_by === currentUserId
  const isClaimed = !!task.claimed_by

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isClaimed ? 'bg-coral-400' : 'bg-coral-200'
          }`}
        />
        <span className="text-base text-[#1A0A00]/80 truncate">{task.label}</span>
      </div>
      <div className="flex-shrink-0 ml-3">
        {isClaimed ? (
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              isMine
                ? 'bg-coral-400 text-white'
                : 'bg-coral-100 text-coral-400'
            }`}
          >
            {isMine ? 'you' : claimerName ?? 'claimed'}
          </span>
        ) : canClaim ? (
          <button
            onClick={() => onClaim(task.id)}
            className="text-sm font-medium text-coral-400 border border-coral-300 px-3 py-1 rounded-full active:scale-95 transition-transform"
          >
            claim it
          </button>
        ) : (
          <span className="text-sm text-[#1A0A00]/30">not claimed yet</span>
        )}
      </div>
    </div>
  )
}
