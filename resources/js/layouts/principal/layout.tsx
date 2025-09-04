import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { usePage } from '@inertiajs/react';

interface PageProps {
  user?: {
    name?: string;
    email?: string;
  };
}

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage();
  const user = (props as unknown as PageProps)?.user ?? {};
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
