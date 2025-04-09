import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { BookingHeaderProps } from './types';
import StatusBadge from '../StatusBadge';

const BookingHeader: React.FC<BookingHeaderProps> = ({
  booking,
  formatDate,
  hasVerifiableFlights,
  verifyFlights,
  isVerifying,
  verificationData
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{booking.name}</h1>
            <StatusBadge status={booking.status} className="px-3 py-1 text-sm" />
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {formatDate(booking.createdAt)}
          </p>
        </div>
        
        {/* Show verify button only if there are confirmed flights */}
        {hasVerifiableFlights && (
          <button 
            onClick={verifyFlights}
            disabled={isVerifying}
            className="flex items-center text-primary hover:text-primary/80"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            Verify Flights
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingHeader;