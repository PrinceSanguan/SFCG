import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, GraduationCap, ChevronDown, Settings, User, BookOpen, Upload, Crown } from 'lucide-react';

interface UserProps { name?: string; email?: string }
export function Sidebar({ user }: { user: UserProps }) {
  const { url } = usePage();
  const isActive = (path: string) => url.startsWith(path);
  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Adviser Portal</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          <Link href={route('adviser.dashboard')} className="w-full">
            <Button variant={isActive('/adviser/dashboard') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <LayoutDashboard size={18} /> Dashboard
            </Button>
          </Link>
          {/* Grade Management Section (mirrors Instructor) */}
          <div className="w-full">
            <Button
              variant={url.startsWith('/adviser/grades') ? 'secondary' : 'ghost'}
              className="flex w-full items-center justify-between rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} />
                Grade Management
              </div>
              <ChevronDown size={16} />
            </Button>
            <div className="ml-6 mt-1 space-y-1">
              <Link href={route('adviser.grades.index')} className="w-full">
                <Button variant={url.startsWith('/adviser/grades') && !url.includes('/create') && !url.includes('/upload') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm">
                  <BookOpen size={16} /> View Grades
                </Button>
              </Link>
              <Link href={route('adviser.grades.create')} className="w-full">
                <Button variant={url.includes('/adviser/grades/create') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm">
                  <GraduationCap size={16} /> Input Grade
                </Button>
              </Link>
              <Link href={route('adviser.grades.upload')} className="w-full">
                <Button variant={url.includes('/adviser/grades/upload') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm">
                  <Upload size={16} /> Upload CSV
                </Button>
              </Link>
            </div>
          </div>

          {/* Honor Tracking */}
          <Link href={route('adviser.honors.index')} className="w-full">
            <Button variant={url.startsWith('/adviser/honors') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <Crown size={18} /> Honor Tracking
            </Button>
          </Link>
        </nav>
      </div>
      <div className="border-t p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/api/placeholder/32/32" alt={user?.name ?? 'User'} />
            <AvatarFallback>{(user?.name ?? 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name ?? 'User'}</span>
            <span className="text-xs text-gray-500">{user?.email ?? ''}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={route('adviser.dashboard')} className="w-full">
                <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                  <Settings size={16} /> Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={route('auth.logout')} className="flex w-full cursor-pointer"><User size={16} /> Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


