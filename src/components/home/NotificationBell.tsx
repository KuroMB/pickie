'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationPanel from './NotificationPanel'
import type { AppNotification } from '@/lib/types'

interface NotificationBellProps {
  userId: string
  householdId: string
}

export default function NotificationBell({ userId, householdId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const loadedRef = useRef(false)

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as AppNotification[])
  }

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    load()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const unread = notifications.filter((n) => !n.read).length

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (!unreadIds.length) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function handleOpen() {
    setOpen(true)
    markAllRead()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="notifications"
        className="relative w-8 h-8 flex items-center justify-center text-coral-300 active:scale-95 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-coral-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
