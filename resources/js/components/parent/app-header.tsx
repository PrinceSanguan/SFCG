import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UserProps {
  name?: string;
  email?: string;
}

export function ParentHeader({ user }: { user: UserProps }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="/image/logo.jpg" 
            alt="School Logo" 
            className="h-6 w-6 object-contain rounded"
          />
          <h1 className="text-lg font-semibold">Parent Portal</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name ?? 'User'}</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem asChild>
              <Link href={route('parent.settings')} className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={route('parent.settings')} className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={route('auth.logout')} className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
