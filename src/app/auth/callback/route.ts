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
      // Always sign out after confirmation so the user signs in fresh in their
      // main browser. This avoids PKCE cookie mismatch when the confirmation
      // email is opened in a webview (Gmail, etc.) that has no code-verifier.
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('confirmed', '1')
      if (next) loginUrl.searchParams.set('next', next)
      return NextResponse.redirect(loginUrl.toString())
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
