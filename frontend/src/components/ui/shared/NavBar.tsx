'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLogout } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  roles: string[]
}

export function NavBar() {
  const { user } = useAuth()
  const { mutate: logout, isPending } = useLogout()
  const pathname = usePathname()

  // Simplest roles extraction
  const roles = user?.roles ?? []

  const dashboardItems: NavItem[] = [
    { href: '/dashboard/admin/classes/class-list', label: 'Class List', roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/sections/section-list', label: 'Sections',    roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/subjects/subject-list', label: 'Subjects',   roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/teachers/teacher-list', label: 'Teachers',   roles: ['SeniorAdmin','Management'] },
    { href: '/dashboard/admin/videos',          label: 'All Videos',    roles: ['SeniorAdmin','Management','Admin'] },
    { href: '/dashboard/admin/videos/upload-video', label: 'Upload Video', roles: ['SeniorAdmin','Management','Admin'] },
    { href: '/dashboard/admin/videos/feedback',     label: 'My Feedback',  roles: ['Teacher'] },
    { href: '/dashboard/admin/videos/reviewer',     label: 'To Review',    roles: ['Teacher'] },
  ]

  const allowedItems = dashboardItems.filter(item =>
    item.roles.some(role => roles.includes(role))
  )

  return (
    <nav className="flex items-center justify-between p-4 bg-navbar-bg">
      <div className="flex items-center space-x-4">
  

        {user && (
          <>
            {/* Desktop-only */}
            <div className="hidden md:flex space-x-2">
              <Link href="/dashboard/profile">
                <Button variant={pathname === '/dashboard' ? 'default' : 'outline'}>
                  Profile
                </Button>
              </Link>
              {allowedItems.map(item => (
                <Link href={item.href} key={item.href}>
                  <Button variant={pathname.startsWith(item.href) ? 'default' : 'outline'}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile-only */}
            <Sheet >
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4 pt-10 bg-navbar-bg">
                 <div className='flex justify-between items-center py-5'>
                   {user ? (
          <>
            <span className="font-bold">Hello, {user.name}</span>
            <Button
              variant="link"
              onClick={() => logout()}
              disabled={isPending}
            >
              {isPending ? 'Logging out…' : 'Logout'}
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
                 </div>
                <div className="flex flex-col space-y-4">
                  <Link href="/dashboard/profile">
                    <Button
                      variant={pathname === '/dashboard' ? 'default' : 'outline'}
                      className="w-full text-left"
                    >
                      Profile
                    </Button>
                  </Link>
                  {allowedItems.map(item => (
                    <Link href={item.href} key={item.href}>
                      <Button
                        variant={pathname.startsWith(item.href) ? 'default' : 'outline'}
                        className="w-full text-left"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="font-bold">Hello, {user.name}</span>
            <Button
              variant="link"
              onClick={() => logout()}
              disabled={isPending}
            >
              {isPending ? 'Logging out…' : 'Logout'}
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
