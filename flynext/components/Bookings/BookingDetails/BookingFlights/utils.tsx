import React from 'react';
import { Plane, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Format ISO date string to localized date and time
 */
export const formatDateTime = (isoString: string | undefined): string => {
  if (!isoString) return 'N/A';

  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get appropriate text color class based on flight status
 */
export const getStatusColor = (status: string): string => {
  const upperStatus = status.toUpperCase();
  switch(upperStatus) {
    case 'SCHEDULED': return 'text-green-600';  // Green for on-schedule
    case 'CANCELLED': return 'text-red-600';    // Red for cancelled
    case 'DELAYED': return 'text-amber-600';    // Amber for delayed
    case 'DEPARTED': return 'text-blue-600';    // Blue for in-progress
    case 'LANDED': return 'text-indigo-600';    // Indigo for completed
    default: return 'text-gray-600';            // Gray for unknown
  }
};

/**
 * Get icon component based on flight status
 */
export const getStatusIcon = (status: string): React.ReactNode => {
  const upperStatus = status.toUpperCase();
  switch(upperStatus) {
    case 'SCHEDULED': return <CheckCircle className="w-3 h-3 mr-1" />;  // Check icon for scheduled
    case 'CANCELLED': return <XCircle className="w-3 h-3 mr-1" />;      // X icon for cancelled
    case 'DELAYED': return <AlertTriangle className="w-3 h-3 mr-1" />;  // Alert for delayed
    case 'DEPARTED': return <Plane className="w-3 h-3 mr-1" />;         // Plane for departed
    case 'LANDED': return <CheckCircle className="w-3 h-3 mr-1" />;     // Check for landed
    default: return <Plane className="w-3 h-3 mr-1" />;                 // Plane for unknown
  }
};