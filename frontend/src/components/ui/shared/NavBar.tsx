// src/components/NavBar.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex justify-between p-4 bg-gray-100">
      <div className="space-x-4">
        <Link href="/">Home</Link>
        {user && <Link href="/dashboard">Dashboard</Link>}
      </div>
      <div>
        {user ? (
          <>
            <span className="mr-4">Hello, {user.userId}</span>
            <button onClick={logout} className="underline">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
