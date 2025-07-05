"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Image src="https://placehold.co/40x40.png" alt="Huashang HAIS Logo" width={40} height={40} data-ai-hint="company logo" />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <Link href="/dashboard" className="text-lg font-semibold text-sidebar-primary">Huashang HAIS</Link>
              <p className="text-xs text-sidebar-foreground/80">HR & Payroll System</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav userRole={user?.role} />
        </SidebarContent>
        {/* SidebarFooter can be added here if needed */}
      </Sidebar>
      <div className="relative flex min-h-svh flex-1 flex-col bg-background">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
          </main>
      </div>
    </SidebarProvider>
  );
}