import { NextRequest, NextResponse } from 'next/server'

const PROJECT_REF = 'vioqdvmojmokxmfnhcjq'
const CHUNK_SIZE = 3180

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // Call Supabase Auth REST API directly to get the session tokens
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    }
  )

  if (!res.ok) {
    const body = await res.json()
    return NextResponse.json(
      { error: body.error_description ?? body.msg ?? 'Invalid email or password' },
      { status: 401 }
    )
  }

  const session = await res.json()
  const response = NextResponse.json({ success: true })

  // Write the session cookie in the exact format @supabase/ssr expects:
  // cookie name: sb-{project-ref}-auth-token
  // value: JSON-stringified session, chunked into 3180-byte pieces if large
  const value = JSON.stringify(session)
  const cookieName = `sb-${PROJECT_REF}-auth-token`
  const opts = {
    path: '/',
    sameSite: 'lax' as const,
    secure: true,
    maxAge: session.expires_in ?? 3600,
  }

  if (value.length <= CHUNK_SIZE) {
    response.cookies.set(cookieName, value, opts)
  } else {
    for (let i = 0; i * CHUNK_SIZE < value.length; i++) {
      response.cookies.set(`${cookieName}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), opts)
    }
  }

  return response
}
