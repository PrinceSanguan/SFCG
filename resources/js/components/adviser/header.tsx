import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UserProps { name?: string; email?: string }
export function Header({ user }: { user: UserProps }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/image/logo.jpg"
            alt="School Logo"
            className="h-6 w-6 object-contain rounded"
          />
          <h1 className="text-lg font-semibold">Adviser Portal</h1>
        </div>
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
            <Link href={route('adviser.profile.index')} className="w-full">
              <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                <User size={16} />
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href={route('adviser.profile.index')} className="w-full">
              <DropdownMenuItem className="flex w-full cursor-pointer items-center gap-2">
                <Settings size={16} />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={route('auth.logout')} className="flex w-full cursor-pointer items-center gap-2">
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


