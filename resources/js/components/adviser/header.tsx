import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UserProps { name?: string; email?: string }

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Header({ user }: { user: UserProps }) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-4 md:px-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                {getInitials(user?.name)}
              </span>
              <span className="text-sm font-medium">{user?.name ?? 'User'}</span>
              <ChevronDown size={16} />
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


