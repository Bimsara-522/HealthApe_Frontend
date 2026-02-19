
//Sidebar Component
//It provides navigation links to different sections of the dashboard

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';


// Import icons from lucide-react
import {
  Activity,       // Dashboard
  Upload,         // Upload Files
  FileText,       // Medical Records
  Pill,           // Medications
  Calendar,       // Appointments
  MessageSquare,  // AI Assistant
  Sparkles,       // Insights
  Settings,       // Settings
  LogOut,         // Log Out
} from 'lucide-react';


//Navigation items for the sidebar menu
//Array of objects - each defines a menu item
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Activity },
  { name: 'Upload Files', href: '/dashboard/upload', icon: Upload },
  { name: 'Medical Records', href: '/dashboard/records', icon: FileText },
  { name: 'Medications', href: '/dashboard/medications', icon: Pill },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'AI Assistant', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Insights', href: '/dashboard/insights', icon: Sparkles },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];


//Props interface
interface SidebarProps {
  isOpen: boolean;      //Is sidebar visible on mobile?
  onClose: () => void;  //Function to close sidebar
}


//Sidebar component
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  //usePathname() gives us the current URL path
  //We use this to highlight the active menu item
  const pathname = usePathname();

  return (
    <>
      {/* 
          OVERLAY (Mobile only)
          Dark background that appears behind sidebar on mobile
          Clicking it closes the sidebar
      */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={cn(
          //Base styles
          'fixed top-0 left-0 z-50 h-full w-[260px]',
          'bg-white border-r border-gray-200',
          'flex flex-col',
          //Animation for sliding in/out
          'transition-transform duration-300 ease-in-out',
          //Desktop: always visible (translate-x-0 = normal position)
          'lg:translate-x-0',
          //Mobile: slide based on isOpen state
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* LOGO SECTION*/}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          {/* Logo circle with monkey emoji */}
          <div className="w-10 h-10 relative">
            <Image
                src="/HealthApeLogo.png"
                alt="HealthApe Logo"
                fill
                className="object-contain"
                priority
            />
            </div>

          {/* Brand name */}
          <span className="text-xl font-bold text-blue-600">HealthApe</span>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {/* Loop through each navigation item */}
            {navigationItems.map((item) => {
              // Check if this item is the current page
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile after clicking
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={cn(
                      // Base styles for all items
                      'flex items-center gap-3 px-4 py-3 rounded-xl',
                      'transition-all duration-200',
                      // Conditional styles based on active state
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'  // Active item
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'  // Inactive
                    )}
                  >
                    {/* Icon */}
                    <item.icon 
                      className={cn(
                        'w-5 h-5',
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      )} 
                    />
                    {/* Menu item text */}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* LOGOUT BUTTON (Bottom) */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              // TODO: Add actual logout logic later
              console.log('Logout clicked');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
