import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, Bell, ChevronDown, LayoutDashboard, Settings, Users, UserCheck, ChevronRight, GraduationCap, BookOpen, UserCog, Crown, Building2, UserPlus, Notebook, Shield } from 'lucide-react';
import { useState } from 'react';

interface User {
    name?: string;
    email?: string;
}

interface SidebarProps {
    user: User;
}

export function Sidebar({ user }: SidebarProps) {
    const { url } = usePage(); // Get the current route
    const [isAccountManagementExpanded, setIsAccountManagementExpanded] = useState(true); // Start expanded
    const [isStudentsExpanded, setIsStudentsExpanded] = useState(true);

    // Function to check if the route matches
    const isActive = (path: string) => url.startsWith(path);
    
    // Check if any account management route is active
    const isAccountManagementActive = isActive('/admin/users') || isActive('/admin/parents') || 
                                    isActive('/admin/students') || isActive('/admin/faculty') || 
                                    isActive('/admin/administrators') || isActive('/admin/registrars') ||
                                    isActive('/admin/instructors') || isActive('/admin/teachers') ||
                                    isActive('/admin/advisers') || isActive('/admin/chairpersons') ||
                                    isActive('/admin/principals');

    return (
        <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
            {/* Header with logo */}
            <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Portal</h2>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('admin.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/admin/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* Account Management Section */}
                    <div className="w-full">
                        <Button
                            variant={isAccountManagementActive ? 'secondary' : 'ghost'}
                            onClick={() => setIsAccountManagementExpanded(!isAccountManagementExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <Users size={18} />
                                Account Management
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isAccountManagementExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                        
                        {/* Account Management Submenu */}
                        {isAccountManagementExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('admin.users.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/users') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Users size={16} />
                                        All Users
                                    </Button>
                                </Link>
                                
                                <Link href={route('admin.administrators.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/administrators') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Crown size={16} />
                                        Administrators
                                    </Button>
                                </Link>

                                <Link href={route('admin.registrars.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/registrars') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Building2 size={16} />
                                        Registrars
                                    </Button>
                                </Link>

                                <Link href={route('admin.principals.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/principals') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Crown size={16} />
                                        Principals
                                    </Button>
                                </Link>

                                <Link href={route('admin.chairpersons.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/chairpersons') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserCog size={16} />
                                        Chairpersons
                                    </Button>
                                </Link>

                                <Link href={route('admin.teachers.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/teachers') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        Teachers
                                    </Button>
                                </Link>

                                <Link href={route('admin.instructors.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/instructors') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        Instructors
                                    </Button>
                                </Link>

                                <Link href={route('admin.advisers.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/advisers') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserPlus size={16} />
                                        Advisers
                                    </Button>
                                </Link>
                                
                                <Link href={route('admin.parents.index')} className="w-full">
                                    <Button
                                        variant={isActive('/admin/parents') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserCheck size={16} />
                                        Parent Accounts
                                    </Button>
                                </Link>

                                {/* Students submenu with dropdown toggle */}
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <Link href={route('admin.students.index')} className="w-full">
                                            <Button
                                                variant={isActive('/admin/students') && !isActive('/admin/students/elementary') && !isActive('/admin/students/junior-highschool') && !isActive('/admin/students/senior-highschool') && !isActive('/admin/students/college') ? 'secondary' : 'ghost'}
                                                className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <GraduationCap size={16} />
                                                All Students
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="ml-1 h-8 w-8"
                                            onClick={() => setIsStudentsExpanded(!isStudentsExpanded)}
                                            aria-label="Toggle students submenu"
                                        >
                                            <ChevronRight size={16} className={`transition-transform duration-200 ${isStudentsExpanded ? 'rotate-90' : ''}`} />
                                        </Button>
                                    </div>
                                    {isStudentsExpanded && (
                                        <div className="ml-6 space-y-1">
                                            <Link href={route('admin.students.elementary')} className="w-full">
                                                <Button
                                                    variant={isActive('/admin/students/elementary') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Elementary
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.students.junior-highschool')} className="w-full">
                                                <Button
                                                    variant={isActive('/admin/students/junior-highschool') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Junior Highschool
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.students.senior-highschool')} className="w-full">
                                                <Button
                                                    variant={isActive('/admin/students/senior-highschool') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Senior Highschool
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.students.college')} className="w-full">
                                                <Button
                                                    variant={isActive('/admin/students/college') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    College
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Academic & Curriculum Management */}
                    <Link href={route('admin.academic.index')} className="w-full">
                        <Button
                            variant={isActive('/admin/academic') && !isActive('/admin/academic/honors') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Notebook size={18} />
                            Academic & Curriculum
                        </Button>
                    </Link>

                    {/* Honor Tracking & Ranking */}
                    <Link href={route('admin.academic.honors')} className="w-full">
                        <Button
                            variant={isActive('/admin/academic/honors') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Crown size={18} />
                            Honor Tracking & Ranking
                        </Button>
                    </Link>

                    {/* Certificates */}
                    <Link href="/admin/academic/certificates" className="w-full">
                        <Button
                            variant={isActive('/admin/academic/certificates') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Notebook size={18} />
                            Certificates
                        </Button>
                    </Link>

                    {/* Reports and Archiving */}
                    <Link href={route('admin.reports.index')} className="w-full">
                        <Button
                            variant={isActive('/admin/reports') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <BarChart size={18} />
                            Reports & Archiving
                        </Button>
                    </Link>

                    {/* Notifications & Transparency */}
                    <Link href={route('admin.notifications.index')} className="w-full">
                        <Button
                            variant={isActive('/admin/notifications') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Bell size={18} />
                            Notifications
                        </Button>
                    </Link>

                    {/* System Audit & Security */}
                    <Link href={route('admin.security.index')} className="w-full">
                        <Button
                            variant={isActive('/admin/security') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Shield size={18} />
                            Security & Audit
                        </Button>
                    </Link>
                </nav>
            </div>

            {/* Profile Section */}
            <div className="border-t p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="/api/placeholder/32/32" alt={user?.name ?? 'User'} />
                        <AvatarFallback>{(user?.name ?? 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name ?? 'User'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email ?? ''}</span>
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
                            <Link href={route('admin.settings')} className="w-full">
                                <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                                    <Settings size={16} />
                                    Settings
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('auth.logout')} className="flex w-full cursor-pointer">
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}