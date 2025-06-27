// app/dashboard/page.tsx
'use client';
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>You are logged in!</p>
      </div>
    </ProtectedRoute>
  );
}
