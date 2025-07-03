// src/app/dashboard/change-password/page.tsx

'use client'

import { FormEvent, useState } from 'react'
import { useChangePassword } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/route/ProtectedRoute'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { mutate, isPending } = useChangePassword()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => toast.success('Password changed'),
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <ProtectedRoute>
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your current password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Updating…' : 'Change Password'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </ProtectedRoute>
  )
}
