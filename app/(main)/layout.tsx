// Main UI Layout: Sidebar + Top Navbar
'use client';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/client';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // prevents dashboard flash
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogoutClick={() => setShowLogoutConfirm(true)} />
      <div className="lg:pl-[260px]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>
        <main className="p-4 lg:p-6">{children}</main>
        {showLogoutConfirm && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    {/* Backdrop (blur + dim) */}
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
      aria-hidden="true"
    />

    {/* Modal */}
    <div className="relative w-[420px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold">
          ?
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            Confirm logout
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Are you sure you want to log out?
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowLogoutConfirm(false)}
          disabled={isLoggingOut}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              setIsLoggingOut(true);
              await api.post('/auth/logout');                // ✅ from useAuth()
              setShowLogoutConfirm(false);
              router.replace('/login');      // ✅ ensure redirect
            } finally {
              setIsLoggingOut(false);
            }
          }}
          disabled={isLoggingOut}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'OK'}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
