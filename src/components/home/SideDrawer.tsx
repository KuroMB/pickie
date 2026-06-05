'use client'

import { useEffect, useRef, useState } from 'react'
import type { Profile } from '@/lib/types'

interface SideDrawerProps {
  profile: Profile
  onClose: () => void
  onSignOut: () => void
}

function CopyLinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#1A0A00]/50 mb-0.5">{label}</p>
        <p className="text-xs text-[#1A0A00]/30 truncate font-mono">{url}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 text-xs font-medium text-coral-400 border border-coral-300 px-3 py-1.5 rounded-full active:scale-95 transition-all"
      >
        {copied ? 'copied!' : 'copy'}
      </button>
    </div>
  )
}

export default function SideDrawer({ profile, onClose, onSignOut }: SideDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isPlanner = profile.role === 'planner'
  const household = profile.household
  const memberInviteUrl = household
    ? `${window.location.origin}/invite/${household.invite_code}`
    : null
  const plannerInviteUrl = household
    ? `${window.location.origin}/invite/${household.planner_invite_code}`
    : null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const initial = profile.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-xl flex flex-col overflow-y-auto">
        {/* close button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-coral-100">
          <span className="text-sm font-semibold text-[#1A0A00]">menu</span>
          <button
            onClick={onClose}
            className="text-[#1A0A00]/40 hover:text-[#1A0A00]/70 transition-colors text-xl leading-none"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 px-5 py-5 space-y-6">
          {/* profile section */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-coral-400 flex items-center justify-center text-white text-base font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A0A00] truncate">{profile.name}</p>
                <p className="text-xs text-[#1A0A00]/40 truncate">{profile.email}</p>
              </div>
            </div>
            {household && (
              <p className="text-xs text-[#1A0A00]/40 mt-2 pl-1">
                {household.name} · {profile.role}
              </p>
            )}
          </div>

          {/* invite section */}
          {household && memberInviteUrl && plannerInviteUrl && (
            <div>
              <p className="text-xs font-semibold text-[#1A0A00]/50 uppercase tracking-wide mb-3">
                invite family
              </p>
              <div className="space-y-3">
                <CopyLinkRow label="member link (suggest & view)" url={memberInviteUrl} />
                {isPlanner && (
                  <CopyLinkRow label="planner link (full edit access)" url={plannerInviteUrl} />
                )}
              </div>
              <p className="text-[11px] text-[#1A0A00]/30 mt-3 leading-relaxed">
                share this link — they'll be added to {household.name} automatically after signing in.
              </p>
            </div>
          )}
        </div>

        {/* sign out */}
        <div className="px-5 pb-8 pt-4 border-t border-coral-100">
          <button
            onClick={onSignOut}
            className="w-full py-2.5 text-sm font-medium text-[#1A0A00]/50 border border-[#1A0A00]/10 rounded-xl active:scale-[0.98] transition-transform"
          >
            sign out
          </button>
        </div>
      </div>
    </div>
  )
}
