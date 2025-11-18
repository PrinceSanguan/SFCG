import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, LayoutDashboard, ChevronRight, UserCog, Award, FileText, CheckCircle } from 'lucide-react';
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
    const [isHonorTrackingExpanded, setIsHonorTrackingExpanded] = useState(true);
    const [isReportsExpanded, setIsReportsExpanded] = useState(true);

    // Function to check if the route matches
    const isActive = (path: string) => url.startsWith(path);

    // Check if any honor tracking route is active
    const isHonorTrackingActive = isActive('/principal/honors');

    // Check if any reports route is active
    const isReportsActive = isActive('/principal/reports');

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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Principal Portal</h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('principal.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/principal/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* Account Management */}
                    <Link href={route('principal.account.index')} className="w-full">
                        <Button
                            variant={isActive('/principal/account') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <UserCog size={18} />
                            Account
                        </Button>
                    </Link>


                    {/* Honor Tracking Section */}
                    <div className="w-full">
                        <Button
                            variant={isHonorTrackingActive ? 'secondary' : 'ghost'}
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
                        
                        {/* Honor Tracking Submenu */}
                        {isHonorTrackingExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('principal.honors.index')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/honors') && !isActive('/principal/honors/pending') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Award size={16} />
                                        All Honors
                                    </Button>
                                </Link>
                                <Link href={route('principal.honors.pending')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/honors/pending') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <CheckCircle size={16} />
                                        Pending Approval
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Reports and Archiving Section */}
                    <div className="w-full">
                        <Button
                            variant={isReportsActive ? 'secondary' : 'ghost'}
                            onClick={() => setIsReportsExpanded(!isReportsExpanded)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart size={18} />
                                Reports & Archiving
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`transition-transform duration-200 ${
                                    isReportsExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                        
                        {/* Reports Submenu */}
                        {isReportsExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link href={route('principal.reports.index')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/reports') && !isActive('/principal/reports/academic-performance') && !isActive('/principal/reports/grade-trends') && !isActive('/principal/reports/honor-statistics') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BarChart size={16} />
                                        Overview
                                    </Button>
                                </Link>
                                <Link href={route('principal.reports.academic-performance')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/reports/academic-performance') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <FileText size={16} />
                                        Academic Performance
                                    </Button>
                                </Link>
                                <Link href={route('principal.reports.grade-trends')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/reports/grade-trends') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <BarChart size={16} />
                                        Grade Trends
                                    </Button>
                                </Link>
                                <Link href={route('principal.reports.honor-statistics')} className="w-full">
                                    <Button
                                        variant={isActive('/principal/reports/honor-statistics') ? 'secondary' : 'ghost'}
                                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Award size={16} />
                                        Honor Statistics
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
