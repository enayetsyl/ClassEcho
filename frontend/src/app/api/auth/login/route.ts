// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // 1️⃣ pull creds out of the incoming body
  const { email, password } = await req.json()

  // 2️⃣ call your Express backend’s v1 login endpoint
  //    (point 3 in the checklist)
  const loginRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      // no credentials: 'include' here, because we only need the JSON response
    }
  )

  if (!loginRes.ok) {
    // bubble up the error message from Express (optional)
    const { message } = await loginRes.json()
    return NextResponse.json({ ok: false, message }, { status: 401 })
  }

  // 3️⃣ extract the JWT + user from your Express response
  const { token, user } = await loginRes.json()

  // 4️⃣ now set that token on your *frontend* domain as an HttpOnly cookie
  const res = NextResponse.json({ ok: true, user })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return res
}
