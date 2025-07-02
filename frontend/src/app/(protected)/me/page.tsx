// src/app/me/page.tsx
import { cookies } from 'next/headers'

export default async function MePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const user = await res.json()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <p className="mt-2 text-gray-600">Email: {user.email}</p>
    </div>
  )
}
