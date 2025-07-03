'use client'

import { useGetAllTeachers, useToggleTeacherActive } from '@/hooks/use-user'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/route/ProtectedRoute'

export default function TeacherListPage() {
  const { data: teachers, isPending } = useGetAllTeachers()
  const { mutate: toggle, isPending: isToggling } = useToggleTeacherActive()

  if (isPending) return <p>Loading teachers…</p>

  return (
    <ProtectedRoute>
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers?.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.email}</td>
                  <td className="p-2">
                    {t.active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      disabled={isToggling}
                      onClick={() => toggle(t._id!)}
                    >
                      {t.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ProtectedRoute>
  )
}
