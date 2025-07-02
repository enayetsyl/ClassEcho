// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      // backend must set HttpOnly “token” cookie
      router.push('/me')
    } else {
      const { message } = await res.json()
      setError(message || 'Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white rounded shadow"
      >
        <h1 className="mb-6 text-xl font-medium">Login</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <label className="block mb-4">
          <span className="block text-sm font-medium">Email</span>
          <input
            type="email"
            required
            className="w-full p-2 mt-1 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span className="block text-sm font-medium">Password</span>
          <input
            type="password"
            required
            className="w-full p-2 mt-1 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </form>
    </div>
  )
}
