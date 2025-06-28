"use client";

import React, { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">Huashang HAIS</header>
      <main className="p-6">{children}</main>
    </div>
  );
}
