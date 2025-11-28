import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, LayoutDashboard, Users, UserCheck, ChevronRight, GraduationCap, BookOpen, UserCog, Crown, Building2, Notebook } from 'lucide-react';
import { useState } from 'react';

interface User {
    name?: string;
    email?: string;
    user_role?: string;
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
    const isAccountManagementActive = isActive('/registrar/users') || isActive('/registrar/parents') || 
                                    isActive('/registrar/students') || isActive('/registrar/faculty') || 
                                    isActive('/registrar/administrators') || isActive('/registrar/registrars') ||
                                    isActive('/registrar/instructors') || isActive('/registrar/teachers') ||
                                    isActive('/registrar/advisers') || isActive('/registrar/chairpersons') ||
                                    isActive('/registrar/principals');

    return (
        <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
            {/* Header with logo */}
            <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <img
                        src="/image/logo.jpg"
                        alt="School Logo"
                        className="h-8 w-8 object-contain rounded-full"
                    />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registrar Portal</h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('registrar.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/registrar/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* Account Management Section (View Only - No Creation) */}
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
                                <Link href={route('registrar.users.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/users') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Users size={16} />
                                        All Users
                                    </Button>
                                </Link>
                                
                                <Link href={route('registrar.administrators.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/administrators') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Crown size={16} />
                                        Administrators
                                    </Button>
                                </Link>

                                <Link href={route('registrar.registrars.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/registrars') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Building2 size={16} />
                                        Registrars
                                    </Button>
                                </Link>

                                <Link href={route('registrar.principals.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/principals') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Crown size={16} />
                                        Principals
                                    </Button>
                                </Link>

                                <Link href={route('registrar.chairpersons.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/chairpersons') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserCog size={16} />
                                        Chairpersons
                                    </Button>
                                </Link>

                                <Link href={route('registrar.teachers.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/teachers') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        Teachers
                                    </Button>
                                </Link>

                                <Link href={route('registrar.instructors.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/instructors') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        Instructors
                                    </Button>
                                </Link>

                                <Link href={route('registrar.advisers.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/advisers') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserCog size={16} />
                                        Advisers
                                    </Button>
                                </Link>
                                
                                <Link href={route('registrar.parents.index')} className="w-full">
                                    <Button
                                        variant={isActive('/registrar/parents') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <UserCheck size={16} />
                                        Parent Accounts
                                    </Button>
                                </Link>

                                {/* Students submenu with dropdown toggle */}
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <Link href={route('registrar.students.index')} className="w-full">
                                            <Button
                                                variant={isActive('/registrar/students') && !isActive('/registrar/students/elementary') && !isActive('/registrar/students/junior-highschool') && !isActive('/registrar/students/senior-highschool') && !isActive('/registrar/students/college') ? 'secondary' : 'ghost'}
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
                                            <Link href={route('registrar.students.elementary')} className="w-full">
                                                <Button
                                                    variant={isActive('/registrar/students/elementary') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Elementary
                                                </Button>
                                            </Link>
                                            <Link href={route('registrar.students.junior_highschool')} className="w-full">
                                                <Button
                                                    variant={isActive('/registrar/students/junior-highschool') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Junior Highschool
                                                </Button>
                                            </Link>
                                            <Link href={route('registrar.students.senior_highschool')} className="w-full">
                                                <Button
                                                    variant={isActive('/registrar/students/senior-highschool') ? 'secondary' : 'ghost'}
                                                    className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    Senior Highschool
                                                </Button>
                                            </Link>
                                            <Link href={route('registrar.students.college')} className="w-full">
                                                <Button
                                                    variant={isActive('/registrar/students/college') ? 'secondary' : 'ghost'}
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
                    <Link href={route('registrar.academic.index')} className="w-full">
                        <Button
                            variant={isActive('/registrar/academic') && !isActive('/registrar/academic/honors') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Notebook size={18} />
                            Academic & Curriculum
                        </Button>
                    </Link>

                    {/* Honor Tracking & Ranking */}
                    <Link href={route('registrar.academic.honors')} className="w-full">
                        <Button
                            variant={isActive('/registrar/academic/honors') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Crown size={18} />
                            Honor Tracking & Ranking
                        </Button>
                    </Link>

                    {/* Certificates */}
                    <Link href={route('registrar.academic.certificates.index')} className="w-full">
                        <Button
                            variant={isActive('/registrar/academic/certificates') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Notebook size={18} />
                            Certificates
                        </Button>
                    </Link>

                    {/* Reports and Archiving */}
                    <Link href={route('registrar.reports.index')} className="w-full">
                        <Button
                            variant={isActive('/registrar/reports') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <BarChart size={18} />
                            Reports & Archiving
                        </Button>
                    </Link>


                </nav>
            </div>
        </div>
    );
}
