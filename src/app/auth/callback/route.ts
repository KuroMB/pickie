import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next) {
        // invite flow: stay signed in, land on the invite page to auto-join
        return NextResponse.redirect(`${origin}${next}`)
      }
      // regular signup: sign out so user goes through the sign-in step
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?confirmed=1`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
