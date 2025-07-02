// src/app/dashboard/layout.tsx
'use client'

import { ReactNode } from 'react'
import { ProtectedRoute } from '@/route/ProtectedRoute'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
