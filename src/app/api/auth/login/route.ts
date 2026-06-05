import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const cookiesToSet: { name: string; value: string; options?: object }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies: { name: string; value: string; options?: object }[]) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? 'Sign in failed' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })

  for (const cookie of cookiesToSet) {
    response.cookies.set(
      cookie.name,
      cookie.value,
      cookie.options as Parameters<typeof response.cookies.set>[2]
    )
  }

  return response
}
