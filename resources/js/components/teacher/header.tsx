import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UserShape { name?: string; email?: string; }
export function Header({ user }: { user: UserShape }) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Teacher Portal</h1>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User size={20} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={route('user.settings')} className="w-full">
                            <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                                <User size={16} />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                        <Link href={route('user.settings')} className="w-full">
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


