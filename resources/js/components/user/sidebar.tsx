import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, CreditCard, LayoutDashboard, MessageSquare, Share, Users } from 'lucide-react';

interface User {
    name: string;
    email: string;
}

interface SidebarProps {
    user: User;
}

export function Sidebar({ user }: SidebarProps) {
    const { url } = usePage(); // Get the current route

    // Function to check if the route matches
    const isActive = (path: string) => url.startsWith(path);

    return (
        <div className="hidden w-64 flex-col border-r bg-white md:flex dark:border-gray-700 dark:bg-gray-800">
            {/* Header with logo */}
            <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin Portal</h2>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                    <Link href={route('user.dashboard')} className="w-full">
                        <Button
                            variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Button>
                    </Link>

                    {/* New navigation items */}
                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Users size={18} />
                        Users
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <BarChart size={18} />
                        Analytics
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <CreditCard size={18} />
                        Billing
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Share size={18} />
                        Referral
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <MessageSquare size={18} />
                        Feedback
                    </Button>
                </nav>
            </div>
        </div>
    );
}
