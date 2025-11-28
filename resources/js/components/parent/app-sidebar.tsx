import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, BookOpen, Crown, User, FileText, Users } from 'lucide-react';

interface UserProps { name?: string; email?: string }

export function ParentAppSidebar({ user }: { user: UserProps }) {
  const { url } = usePage();
  const isActive = (path: string) => url.startsWith(path);
  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="/image/logo.jpg"
            alt="School Logo"
            className="h-8 w-8 object-contain rounded-full"
          />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Parent Portal</h2>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          <Link href={route('parent.dashboard')} className="w-full">
            <Button variant={isActive('/parent/dashboard') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <LayoutDashboard size={18} /> Dashboard
            </Button>
          </Link>
          <Link href={route('parent.profile.index')} className="w-full">
            <Button variant={isActive('/parent/profile') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <Users size={18} /> My Children
            </Button>
          </Link>
          <Link href={route('parent.grades.index')} className="w-full">
            <Button variant={isActive('/parent/grades') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <BookOpen size={18} /> Children's Grades
            </Button>
          </Link>
          <Link href={route('parent.honors.index')} className="w-full">
            <Button variant={isActive('/parent/honors') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <Crown size={18} /> Honor Status
            </Button>
          </Link>
          <Link href={route('parent.certificates.index')} className="w-full">
            <Button variant={isActive('/parent/certificates') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <FileText size={18} /> Certificates
            </Button>
          </Link>
          <Link href={route('parent.settings')} className="w-full">
            <Button variant={isActive('/parent/settings') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2">
              <User size={18} /> My Profile
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
}
