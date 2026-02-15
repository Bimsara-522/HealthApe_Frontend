
import React from 'react';
import { cn } from '@/lib/utils';

// Define what props this component accepts
interface BadgeProps {
  children: React.ReactNode;  // The text inside the badge
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default',  // Default variant if none specified
  className 
}: BadgeProps) {
  
  // Different colors for different variants
  const variantStyles = {
    default: 'bg-gray-100 text-gray-600',      // Gray - for tags like #Blood
    success: 'bg-green-100 text-green-700',    // Green - for "Optimal", "-2 kg"
    warning: 'bg-yellow-100 text-yellow-700',  // Yellow - for warnings
    error: 'bg-red-100 text-red-700',          // Red - for critical
    info: 'bg-blue-100 text-blue-700',         // Blue - for "Normal"
  };

  return (
    <span
      className={cn(
        // Base styles (same for all badges)
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        // Add variant-specific colors
        variantStyles[variant],
        // Allow custom classes to be added
        className
      )}
    >
      {children}
    </span>
  );
}