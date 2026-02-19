
//WelcomeBanner component
//Shows greeting, upcoming appointments, and quick upload button
'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getGreeting } from '@/lib/utils';

//Props interface
interface WelcomeBannerProps {
  userName: string;
  upcomingAppointments?: number;
}

export function WelcomeBanner({ 
  userName, 
  upcomingAppointments = 0 
}: WelcomeBannerProps) {
  //Get time-based greeting from our utility function
  const greeting = getGreeting();

  return (
    <div 
      className="relative overflow-hidden rounded-2xl p-6 text-white"
      //Inline style for the gradient background
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      }}
    >
      {/* Content container */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left side - Greeting text */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            {greeting}, {userName}!
            <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-blue-100">
            {upcomingAppointments > 0
              ? `You have ${upcomingAppointments} upcoming appointment${upcomingAppointments > 1 ? 's' : ''}.`
              : 'No upcoming appointments today.'}
          </p>
        </div>

        {/* Right side - Quick Upload button */}
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>Quick Upload</span>
        </Link>
      </div>
    </div>
  );
}
