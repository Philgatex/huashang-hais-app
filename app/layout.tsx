import type { Metadata } from 'next';
import '@/app/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Huashang HAIS - HR & Payroll',
  description: 'Comprehensive HR and Payroll solution by Huashang HAIS Ltd.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}