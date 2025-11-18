import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LayoutDashboard, BookOpen, Crown, User, Upload, GraduationCap } from 'lucide-react';
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
    const [isGradesExpanded, setIsGradesExpanded] = useState(true);

    // Function to check if the route matches
    const isActive = (path: string) => url.startsWith(path);
    
    // Check if any grades route is active
    const isGradesActive = isActive('/instructor/grades');

    return (
        <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
            {/* Header with logo */}
            <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <img
                        src="/image/logo.jpg"
                        alt="School Logo"
                        className="h-8 w-8 object-contain rounded"
                    />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Instructor Portal</h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('instructor.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/instructor/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* Grade Management Section */}
                    <div className="w-full">
                        <Button
                            variant={isGradesActive ? 'secondary' : 'ghost'}
                            onClick={() => setIsGradesExpanded(!isGradesExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen size={18} />
                                Grade Management
                            </div>
                            <ChevronDown 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isGradesExpanded ? 'rotate-180' : ''
                                }`}
                            />
                        </Button>
                        
                        {/* Grade Management Submenu */}
                        {isGradesExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('instructor.grades.index')} className="w-full">
                                    <Button
                                        variant={isActive('/instructor/grades') && !isActive('/instructor/grades/create') && !isActive('/instructor/grades/upload') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        View Grades
                                    </Button>
                                </Link>
                                
                                <Link href={route('instructor.grades.create')} className="w-full">
                                    <Button
                                        variant={isActive('/instructor/grades/create') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <GraduationCap size={16} />
                                        Input Grade
                                    </Button>
                                </Link>
                                
                                <Link href={route('instructor.grades.upload')} className="w-full">
                                    <Button
                                        variant={isActive('/instructor/grades/upload') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Upload size={16} />
                                        Upload CSV
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Honor Tracking */}
                    <Link href={route('instructor.honors.index')} className="w-full">
                        <Button
                            variant={isActive('/instructor/honors') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Crown size={18} />
                            Honor Tracking
                        </Button>
                    </Link>

                    {/* Profile Management */}
                    <Link href={route('instructor.profile.index')} className="w-full">
                        <Button
                            variant={isActive('/instructor/profile') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <User size={18} />
                            My Profile
                        </Button>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
