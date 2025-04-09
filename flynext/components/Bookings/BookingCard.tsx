'use client';
import { FC } from 'react';
import StatusBadge from './StatusBadge';

interface BookingRoom {
  id: string;
  type: string;
  quantity: number;
  pricePerNight: string;
  amenities: string[];
  totalPrice: number;
}

interface BookingFlight {
  id: string;
  flightId: string;
  bookingReference: string;
}

interface BookingHotel {
  id: string;
  name: string;
  starRating: number;
  address: string;
}

interface BookingProps {
  id: string;
  name: string;
  status: string;
  paymentStatus: string;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  hotel: BookingHotel | null;
  rooms: BookingRoom[];
  flights: BookingFlight[];
  hotelCost: number;
  flightCost: number;
  onClick: () => void;
}

const BookingCard: FC<BookingProps> = ({
  id,
  name,
  status,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  createdAt,
  hotel,
  rooms,
  flights,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="border border-border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        {/* Left side */}
        <div className="flex-1 min-w-0 mr-4">
          <div>
            <h3 className="font-medium text-foreground truncate">{name}</h3>
          </div>
          <p className="text-muted-foreground text-sm truncate mt-0.5">
            {hotel?.name}
          </p>
          
          {/* Dates and room/flight info */}
          <div className="text-sm text-muted-foreground">
            <p className="truncate">
              {checkIn && checkOut ? 
                `${new Date(checkIn).toLocaleDateString()} — ${new Date(checkOut).toLocaleDateString()}` : 
                new Date(createdAt).toLocaleDateString()}
              {nights > 0 && ` · ${nights} night${nights > 1 ? 's' : ''}`}
            </p>
            <p className="truncate">
              {rooms.length > 0 && `${rooms.reduce((total, room) => total + room.quantity, 0)} room${rooms.reduce((total, room) => total + room.quantity, 0) > 1 ? 's' : ''}`}
              {rooms.length > 0 && flights.length > 0 && ' · '}
              {flights.length > 0 && `${flights.length} flight${flights.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        
        {/* Right side */}
        <div className="text-right">
          <p className="font-semibold text-primary">${totalPrice.toFixed(2)}</p>
          <StatusBadge status={status} className="mt-1" />
        </div>
      </div>
    </div>
  );
};

export default BookingCard;