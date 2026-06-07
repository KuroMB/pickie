'use client'

import { useEffect, useRef } from 'react'
import type { AppNotification } from '@/lib/types'

interface NotificationPanelProps {
  notifications: AppNotification[]
  onClose: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function notifIcon(type: string): string {
  if (type === 'suggestion_approved') return '✅'
  if (type === 'suggestion_declined') return '❌'
  if (type === 'suggestion_submitted') return '💡'
  if (type === 'new_poll') return '📨'
  if (type === 'new_meal') return '🍽️'
  return '🔔'
}

export default function NotificationPanel({ notifications, onClose }: NotificationPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div ref={overlayRef} className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-80 max-w-[90vw] h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-coral-100">
          <span className="text-base font-bold text-[#1A0A00]">notifications</span>
          <button onClick={onClose} className="text-[#1A0A00]/40 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-[#1A0A00]/35">no notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-coral-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-5 py-4 ${!n.read ? 'bg-coral-50/60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none flex-shrink-0 mt-0.5">{notifIcon(n.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A0A00] leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-sm text-[#1A0A00]/50 mt-0.5 leading-snug">{n.body}</p>
                      )}
                      <p className="text-xs text-[#1A0A00]/30 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-coral-400 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
