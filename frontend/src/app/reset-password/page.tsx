// src/app/dashboard/reset-password/page.tsx

'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useResetPassword } from '@/hooks/use-auth'
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
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const { mutate, isPending } = useResetPassword()

  useEffect(() => {
    if (!token) {
      toast.error('Missing reset token')
      router.replace('/login')
    }
  }, [token, router])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          toast.success('Password reset! Please log in.')
          router.push('/login')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Choose a new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <CardFooter className="p-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Resetting…' : 'Reset Password'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
