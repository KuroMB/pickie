'use client'

import { VOTE_EMOJI, VOTE_LABEL } from '@/lib/utils'
import type { VoteValue } from '@/lib/types'

interface VoteButtonsProps {
  value: VoteValue | null
  onVote: (v: VoteValue | null) => void
  tally?: { love: number; meh: number; nope: number }
  disabled?: boolean
}

const OPTIONS: VoteValue[] = ['love', 'meh', 'nope']

export default function VoteButtons({ value, onVote, tally, disabled }: VoteButtonsProps) {
  function handleClick(v: VoteValue) {
    if (disabled) return
    onVote(value === v ? null : v)
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((v) => {
        const selected = value === v
        return (
          <button
            key={v}
            onClick={() => handleClick(v)}
            disabled={disabled}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              selected
                ? 'bg-coral-400 border-coral-400 text-white'
                : 'bg-coral-50 border-coral-200 text-[#1A0A00]/70'
            }`}
          >
            <span className="text-lg leading-none">{VOTE_EMOJI[v]}</span>
            <span className="text-[10px] font-medium leading-none">{VOTE_LABEL[v]}</span>
            {tally && (
              <span className={`text-[10px] leading-none ${selected ? 'text-white/80' : 'text-[#1A0A00]/40'}`}>
                {tally[v]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
