// Auth UI Layout: Centered Logo + Minimal Footer
'use client';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div>
      <div>{children}</div>
      <footer>&copy; {new Date().getFullYear()} HealthApe</footer>
    </div>
  );
}
