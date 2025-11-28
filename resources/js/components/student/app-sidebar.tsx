import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, BookOpen, Crown, User, FileText, ChevronRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface UserProps { name?: string; email?: string }

export function StudentAppSidebar({ user }: { user: UserProps }) {
  const { url } = usePage();
  const isActive = (path: string) => url.startsWith(path);
  const [isAcademicExpanded, setIsAcademicExpanded] = useState(true);

  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
      {/* Header with portal title */}
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="/image/logo.jpg"
            alt="School Logo"
            className="h-8 w-8 object-contain rounded-full"
          />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Portal</h2>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          <Link href={route('student.dashboard')} className="w-full">
            <Button variant={isActive('/student/dashboard') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <LayoutDashboard size={18} /> Dashboard
            </Button>
          </Link>

          {/* Academic Section */}
          <div className="w-full">
            <Button
              variant={isActive('/student/subjects') || isActive('/student/grades') || isActive('/student/honors') || isActive('/student/certificates') ? 'secondary' : 'ghost'}
              onClick={() => setIsAcademicExpanded(!isAcademicExpanded)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} />
                Academic Records
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${
                  isAcademicExpanded ? 'rotate-90' : ''
                }`}
              />
            </Button>
            
            {/* Academic Submenu */}
            {isAcademicExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                <Link href={route('student.subjects.index')} className="w-full">
                  <Button variant={isActive('/student/subjects') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <GraduationCap size={16} /> Subjects
                  </Button>
                </Link>
                <Link href={route('student.grades.index')} className="w-full">
                  <Button variant={isActive('/student/grades') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <BookOpen size={16} /> My Grades
                  </Button>
                </Link>
                <Link href={route('student.honors.index')} className="w-full">
                  <Button variant={isActive('/student/honors') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Crown size={16} /> Honor Status
                  </Button>
                </Link>
                <Link href={route('student.certificates.index')} className="w-full">
                  <Button variant={isActive('/student/certificates') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <FileText size={16} /> Certificates
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <Link href={route('student.profile.index')} className="w-full">
            <Button variant={isActive('/student/profile') ? 'secondary' : 'ghost'} className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <User size={18} /> My Profile
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
}
