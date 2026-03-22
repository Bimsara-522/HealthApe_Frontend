
//Header component for the dashboard

'use client';

import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationsBell from '@/app/(main)/notifications/ui/NotificationsBell';

//Props interface
interface HeaderProps {
  onMenuClick: () => void;  //Function to toggle sidebar
  userName?: string;        //User's name
  patientId?: string;       //Patient ID
}

export function Header({ 
  onMenuClick, 
}: HeaderProps) {

  const {user} = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        
        {/* Left side - Hamburger Menu
            Only visible on mobile/tablet (lg:hidden hides it on large screens)
        */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Spacer - pushes right side content to the edge on desktop */}
        <div className="hidden lg:block" />

        {/* Right side - Notifications & User
            ================================ */}
        <div className="flex items-center gap-4">
          
          {/* Notification Bell */}
          {/* <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-500" /> */}
            {/* Red notification dot */}
            {/* <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button> */}
          <NotificationsBell />

          {/* User Info */}
          <div className="flex items-center gap-3">
            {/* User Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            
            {/* Name and Patient ID - Hidden on very small screens */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Patient ID: {user?.sub}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
