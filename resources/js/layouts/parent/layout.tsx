import React from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { ParentAppSidebar } from '@/components/parent/app-sidebar';
import { ParentHeader } from '@/components/parent/app-header';
import { usePage } from '@inertiajs/react';

interface PageProps {
  user?: {
    name?: string;
    email?: string;
  };
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage();
  const user = (props as unknown as PageProps)?.user ?? {};
  return (
    <AppShell variant="sidebar">
      <ParentAppSidebar user={user} />
      <AppContent variant="sidebar">
        <ParentHeader user={user} />
        {children}
      </AppContent>
    </AppShell>
  );
}
