'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface AuthenticatedAppLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedAppLayout: React.FC<AuthenticatedAppLayoutProps> = ({ children }) => {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
};

export default AuthenticatedAppLayout;
