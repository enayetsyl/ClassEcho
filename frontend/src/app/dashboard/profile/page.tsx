'use client'

import { useState, FormEvent } from 'react'
import { useGetProfile, useUpdateProfile } from '@/hooks/use-user'
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
import { ProtectedRoute } from '@/route/ProtectedRoute'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: profile, isPending } = useGetProfile()
  const { mutate: update, isPending: isUpdating } = useUpdateProfile()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

 

  // when profile loads, seed form
  if (profile && name === '') {
    setName(profile.name)
    setPhone(profile.phone ?? '')
    setDateOfBirth(profile.dateOfBirth?.slice(0,10) ?? '')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    update(
      { name, phone, dateOfBirth },
      {
        onSuccess: (updated) => {
          toast.success('Profile updated')
          setName(updated.name)
          setPhone(updated.phone ?? '')
          setDateOfBirth(updated.dateOfBirth?.slice(0,10) ?? '')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center p-4">
      <Card className="w-full max-w-lg mt-10">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Edit your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p>Loading…</p>
          ) : (
            <>
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <CardFooter className="p-0">
                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Saving…' : 'Save Profile'}
                </Button>
              </CardFooter>
            </form>
            <div className="mt-6 space-y-3 text-center">
                <Link href="/dashboard/change-password" className="text-sm text-primary hover:underline">
                  Change Password
                </Link>
              
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  )
}
