import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    name?: string;
    email?: string;
}

interface HeaderProps {
    user: User;
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
            {/* Left side - Page title */}
            <div className="flex items-center gap-4">
                <img 
                    src="/image/logo.jpg" 
                    alt="School Logo" 
                    className="h-6 w-6 object-contain rounded"
                />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Instructor Portal
                </h1>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-4">
                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user?.name ?? 'User'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={route('instructor.profile.index')} className="w-full">
                            <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                                <User size={16} />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                        <Link href={route('instructor.profile.index')} className="w-full">
                            <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                                <Settings size={16} />
                                Settings
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('auth.logout')} className="flex w-full cursor-pointer">
                                <LogOut size={16} />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
