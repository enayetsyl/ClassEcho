// src/app/dashboard/forgot-password/page.tsx

'use client'

import { FormEvent, useState } from 'react'
import { useForgotPassword } from '@/hooks/use-auth'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { mutate, isPending } = useForgotPassword()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate({ email }, {
      onSuccess: () =>
        toast.success('If that account exists, a reset link has been sent.'),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <CardFooter className="p-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Sending…' : 'Send Reset Email'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
