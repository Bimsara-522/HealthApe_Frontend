// lib/utils.ts
// ============================================
// UTILITY FUNCTIONS
// ============================================
// These are helper functions used throughout the app

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() - Combines CSS class names intelligently
 * 
 * Example:
 * cn('bg-red-500', 'bg-blue-500') → 'bg-blue-500' (no conflict)
 * cn('p-4', isLarge && 'p-8') → adds 'p-8' only if isLarge is true
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * getGreeting() - Returns greeting based on time of day
 * 
 * Before noon: "Good Morning"
 * Noon to 5pm: "Good Afternoon"  
 * After 5pm: "Good Evening"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}
