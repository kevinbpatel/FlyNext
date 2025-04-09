'use client';
import { FC } from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedStatus = status.toLowerCase();

  // Define status-specific classes
  const statusClasses = {
    confirmed: 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    // Add more statuses as needed
  };

  // Default to a neutral style if status is not recognized
  const statusClass = statusClasses[normalizedStatus as keyof typeof statusClasses] || 
    'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span 
      className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusClass} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;