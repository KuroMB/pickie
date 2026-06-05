import { redirect } from 'next/navigation'

export default function InvitePage({ params }: { params: { code: string } }) {
  redirect(`/onboard?code=${params.code}`)
}
