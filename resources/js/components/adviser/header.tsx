import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt={user?.name ?? 'User'} />
            <AvatarFallback>{(user?.name ?? 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}


