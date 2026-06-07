import webpush from 'web-push'
import { createServiceClient } from './supabase/server'

if (process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:hello@pickie.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  if (!process.env.VAPID_PRIVATE_KEY) return

  const supabase = createServiceClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, subscription')
    .eq('user_id', userId)

  if (!subs?.length) return

  const message = JSON.stringify(payload)
  const staleIds: string[] = []

  await Promise.allSettled(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, message)
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'statusCode' in err && (err.statusCode === 404 || err.statusCode === 410)) {
          staleIds.push(row.id)
        }
      }
    })
  )

  if (staleIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds)
  }
}

export async function createNotification(params: {
  userId: string
  householdId: string
  type: string
  title: string
  body?: string
  url?: string
}) {
  const supabase = createServiceClient()
  await supabase.from('notifications').insert({
    user_id: params.userId,
    household_id: params.householdId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    url: params.url ?? '/home',
  })
}

export async function notifyAndPush(params: {
  userId: string
  householdId: string
  type: string
  title: string
  body?: string
  url?: string
}) {
  await Promise.all([
    createNotification(params),
    sendPushToUser(params.userId, {
      title: params.title,
      body: params.body ?? '',
      url: params.url,
    }),
  ])
}
