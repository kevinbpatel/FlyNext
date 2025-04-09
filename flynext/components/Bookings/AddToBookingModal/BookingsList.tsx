'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import BookingCard from '../BookingCard';
import { BookingsListProps } from './types';

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  selectedBookingId,
  onSelectBooking,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-center py-4 text-muted-foreground">
        No bookings found. Create a new booking to continue.
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-[350px] overflow-y-auto">
      {bookings.map(booking => (
        <div
          key={booking.id}
          className={`${selectedBookingId === booking.id ? 'ring-2 ring-primary' : ''}`}
        >
          <BookingCard
            {...booking}
            onClick={() => onSelectBooking(booking.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default BookingsList;