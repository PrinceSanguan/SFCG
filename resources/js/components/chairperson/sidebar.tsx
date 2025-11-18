import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart,
    LayoutDashboard,
    UserCheck,
    ChevronRight,
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    Clock,
    Building2
} from 'lucide-react';
import { useState } from 'react';

interface User {
    name?: string;
    email?: string;
}

interface SidebarProps {
    user: User;
}

export function Sidebar({ user }: SidebarProps) {
    const { url } = usePage();
    const [isGradeManagementExpanded, setIsGradeManagementExpanded] = useState(true);
    const [isHonorTrackingExpanded, setIsHonorTrackingExpanded] = useState(true);
    const [isReportsExpanded, setIsReportsExpanded] = useState(true);

    const isActive = (path: string) => url.startsWith(path);

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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chairperson Portal</h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('chairperson.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/chairperson/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* Account Management */}
                    <Link href={route('chairperson.account.index')} className="w-full">
                        <Button
                            variant={isActive('/chairperson/account') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <UserCheck size={18} />
                            Account
                        </Button>
                    </Link>

                    {/* Grade Management Section */}
                    <div className="w-full">
                        <Button
                            variant={isActive('/chairperson/grades') ? 'secondary' : 'ghost'}
                            onClick={() => setIsGradeManagementExpanded(!isGradeManagementExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap size={18} />
                                Grade Management
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isGradeManagementExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                        
                        {isGradeManagementExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('chairperson.grades.index')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/grades') && !isActive('/chairperson/grades/all') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BookOpen size={16} />
                                        Grade Overview
                                    </Button>
                                </Link>
                                
                                <Link href={route('chairperson.grades.all')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/grades/all') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Clock size={16} />
                                        All Grades
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Honor Tracking Section */}
                    <div className="w-full">
                        <Button
                            variant={isActive('/chairperson/honors') ? 'secondary' : 'ghost'}
                            onClick={() => setIsHonorTrackingExpanded(!isHonorTrackingExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <Award size={18} />
                                Honor Tracking
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isHonorTrackingExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                        
                        {isHonorTrackingExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('chairperson.honors.index')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/honors') && !isActive('/chairperson/honors/pending') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Award size={16} />
                                        All Honors
                                    </Button>
                                </Link>
                                
                                <Link href={route('chairperson.honors.pending')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/honors/pending') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Clock size={16} />
                                        Pending Honors
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Reports Section */}
                    <div className="w-full">
                        <Button
                            variant={isActive('/chairperson/reports') ? 'secondary' : 'ghost'}
                            onClick={() => setIsReportsExpanded(!isReportsExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart size={18} />
                                Reports & Analysis
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isReportsExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                        
                        {isReportsExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('chairperson.reports.index')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/reports') && !isActive('/chairperson/reports/academic-performance') && !isActive('/chairperson/reports/department-analysis') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BarChart size={16} />
                                        Overview
                                    </Button>
                                </Link>
                                
                                <Link href={route('chairperson.reports.academic-performance')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/reports/academic-performance') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <TrendingUp size={16} />
                                        Academic Performance
                                    </Button>
                                </Link>
                                
                                <Link href={route('chairperson.reports.department-analysis')} className="w-full">
                                    <Button
                                        variant={isActive('/chairperson/reports/department-analysis') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Building2 size={16} />
                                        Department Analysis
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
}
