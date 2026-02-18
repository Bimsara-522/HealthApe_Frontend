// app/dashboard/layout.tsx
// ============================================
// DASHBOARD LAYOUT
// ============================================
// This layout wraps ALL pages inside /dashboard
// It provides the sidebar and header

'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import api from '@/lib/api';

interface UserData {
  fullName: string;
  patientId: string;
}

// Props interface
interface DashboardLayoutProps {
  children: React.ReactNode;  // The page content
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.log('Not authenticated');
      }
    };

    fetchUser();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p>Loading dashboard...</p>
  //     </div>
  //   );
  // }

  // if (error || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p className="text-red-600">{error || 'User not found'}</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      {/* lg:pl-[260px] adds left padding on large screens to make room for sidebar */}
      <div className="lg:pl-[260px]">
        {/* Header Component */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.fullName}
          patientId={user?.patientId}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
