import { formatDistanceToNow, isPast, isToday, addDays, isBefore } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getExpiryStatus(expiryDate: Date) {
  const now = new Date();
  
  if (isPast(expiryDate) || isToday(expiryDate)) {
    return 'expired'; // Red
  }
  
  const threeDaysFromNow = addDays(now, 3);
  if (isBefore(expiryDate, threeDaysFromNow)) {
    return 'warning'; // Orange
  }

  return 'fresh'; // Green
}

export function getExpiryColor(status: string) {
  switch (status) {
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'fresh': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
