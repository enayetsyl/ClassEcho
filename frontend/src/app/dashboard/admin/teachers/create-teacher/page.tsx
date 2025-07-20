'use client'

import { FormEvent, useState } from 'react'
import { useCreateTeacher } from '@/hooks/use-user'
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
import { useRouter } from 'next/navigation'

export default function CreateTeacherPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { mutate, isPending } = useCreateTeacher()
 const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(
      { name, email },
      {
        onSuccess: () => {
          toast.success('Teacher created; Email sent with login instructions')
          setName('')
          setEmail('')
           router.push('/dashboard/admin/teachers/teacher-list')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <ProtectedRoute>
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Add New Teacher</CardTitle>
          <CardDescription>
            Will receive an email with login instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating…' : 'Create Teacher'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </ProtectedRoute>
  )
}
