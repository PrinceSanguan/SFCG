import React from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StudentAppSidebar } from '@/components/student/app-sidebar';
import { StudentHeader } from '@/components/student/app-header';
import { usePage } from '@inertiajs/react';

interface PageProps {
  user?: {
    name?: string;
    email?: string;
  };
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage();
  const user = (props as unknown as PageProps)?.user ?? {};
  return (
    <AppShell variant="sidebar">
      <StudentAppSidebar user={user} />
      <AppContent variant="sidebar">
        <StudentHeader user={user} />
        {children}
      </AppContent>
    </AppShell>
  );
}
