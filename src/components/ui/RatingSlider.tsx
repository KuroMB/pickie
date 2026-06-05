'use client'

import { useState, useCallback } from 'react'

interface RatingSliderProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function RatingSlider({ value, onChange, disabled }: RatingSliderProps) {
  const pct = ((value - 1) / 9) * 100

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange]
  )

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl flex-shrink-0">😬</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          style={{ '--range-progress': `${pct}%` } as React.CSSProperties}
          className="w-full h-6 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <span className="text-xl flex-shrink-0">🤩</span>
      <span className="text-sm font-medium text-coral-400 w-6 text-center tabular-nums">
        {value}
      </span>
    </div>
  )
}
