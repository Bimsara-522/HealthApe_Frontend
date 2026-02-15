// app/dashboard/layout.tsx
// ============================================
// DASHBOARD LAYOUT
// ============================================
// This layout wraps ALL pages inside /dashboard
// It provides the sidebar and header

'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

// Props interface
interface DashboardLayoutProps {
  children: React.ReactNode;  // The page content
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // State to control sidebar visibility on mobile
  // useState(false) means sidebar starts closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          userName="John Doe"
          patientId="#1234"
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
