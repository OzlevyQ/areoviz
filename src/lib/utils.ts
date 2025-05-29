// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const flightPhaseMapping: Record<number, string> = {
  0: 'Unknown',
  1: 'Pre-Flight',
  2: 'Taxi-Out',
  3: 'Takeoff',
  4: 'Climb',
  5: 'Cruise',
  6: 'Descent',
  7: 'Approach',
  8: 'Landing',
  9: 'Rollout',
  10: 'Taxi-In',
  11: 'Post-Flight'
};

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'high':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    case 'medium':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    case 'low':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'pilot':
      return 'pilot';
    case 'technician':
      return 'technician';
    case 'manager':
      return 'manager';
    default:
      return 'primary';
  }
}

export function getRoleIcon(role: string): string {
  switch (role) {
    case 'pilot':
      return 'Plane';
    case 'technician':
      return 'Wrench';
    case 'manager':
      return 'BarChart3';
    default:
      return 'User';
  }
}
