import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'pickie <noreply@pickie.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pickie.app'

export async function sendNewMealEmail(
  recipients: { name: string; email: string }[],
  meal: { name: string; emoji: string | null; scheduled_date: string },
  householdName: string
) {
  const dateLabel = new Date(meal.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  await Promise.allSettled(
    recipients.map(({ name, email }) =>
      getResend().emails.send({
        from: FROM,
        to: email,
        subject: `${meal.emoji ?? '🍽️'} ${meal.name} is on the menu — vote now`,
        html: `
          <p>Hey ${name},</p>
          <p><strong>${householdName}</strong> has a new dinner planned: <strong>${meal.emoji ?? ''} ${meal.name}</strong> on ${dateLabel}.</p>
          <p>Head over to cast your vote and suggest tweaks.</p>
          <p><a href="${APP_URL}" style="background:#D85A30;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500;">open pickie</a></p>
          <p style="color:#888;font-size:12px;margin-top:24px;">pickie · family dinner planning</p>
        `,
      })
    )
  )
}

export async function sendRatingReminderEmail(
  recipient: { name: string; email: string },
  meal: { name: string; emoji: string | null }
) {
  await getResend().emails.send({
    from: FROM,
    to: recipient.email,
    subject: `how was ${meal.name} last night?`,
    html: `
      <p>Hey ${recipient.name},</p>
      <p>Don't forget to rate last night's dinner: <strong>${meal.emoji ?? ''} ${meal.name}</strong>.</p>
      <p>It takes two seconds and helps plan better meals for everyone.</p>
      <p><a href="${APP_URL}" style="background:#D85A30;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500;">rate it now</a></p>
      <p style="color:#888;font-size:12px;margin-top:24px;">pickie · family dinner planning</p>
    `,
  })
}

export async function sendAdHocPollEmail(
  recipients: { name: string; email: string }[],
  question: string,
  optionA: string,
  optionB: string,
  pollId: string
) {
  await Promise.allSettled(
    recipients.map(({ name, email }) =>
      getResend().emails.send({
        from: FROM,
        to: email,
        subject: `quick poll: ${question}`,
        html: `
          <p>Hey ${name},</p>
          <p><strong>${question}</strong></p>
          <p style="margin-top:16px;">
            <a href="${APP_URL}/poll/${pollId}?vote=a" style="background:#D85A30;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-right:12px;">${optionA}</a>
            <a href="${APP_URL}/poll/${pollId}?vote=b" style="background:#F5C4B3;color:#1A0A00;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500;">${optionB}</a>
          </p>
          <p style="margin-top:16px;">Or vote in the app:</p>
          <p><a href="${APP_URL}">open pickie</a></p>
          <p style="color:#888;font-size:12px;margin-top:24px;">pickie · family dinner planning</p>
        `,
      })
    )
  )
}
