'use client';

import React from 'react';
import { Plane, CreditCard, Building } from 'lucide-react';
import { BookingDetails, Flight, BookingRoom, FlightDetails } from '../../types/booking';

interface OrderSummaryProps {
  booking: BookingDetails | null;
  formatCurrency: (value: string | number | undefined | null) => string;
  calculateHotelCost: () => number;
  calculateFlightCost: () => number;
  calculateTotal: () => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  booking,
  formatCurrency,
  calculateHotelCost,
  calculateFlightCost,
  calculateTotal
}) => {
  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Process hotel logo URL using the images API
  const hotelLogoUrl = booking?.hotel?.logo 
    ? `/api/images?p=${encodeURIComponent(booking.hotel.logo)}`
    : null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sticky top-4">
      {/* FlyNext Logo */}
      <div className="flex items-center mb-4">
        <Plane className="w-4 h-4 text-primary mr-1" />
        <span className="text-base font-medium text-primary">FlyNext</span>
      </div>
      
      <h2 className="text-base font-medium text-card-foreground mb-2">Your Booking Items</h2>
      
      {/* Hotel/Room items - Added this section */}
      {booking && booking.bookingRooms && booking.bookingRooms.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Building className="w-4 h-4 text-primary mr-1" />
            <span className="text-sm font-medium text-card-foreground">Hotel</span>
          </div>
          
          {/* Hotel logo display */}
          {hotelLogoUrl && (
            <div className="mb-2 flex justify-center">
              <img 
                src={hotelLogoUrl} 
                alt={`${booking.hotel?.name || 'Hotel'} logo`}
                className="h-16 object-contain"
              />
            </div>
          )}
          
          <div className="space-y-2 mb-4">
            {booking.bookingRooms.map((bookingRoom: BookingRoom, index: number) => (
              <div key={index} className="px-3 py-2 bg-muted rounded">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-sm text-card-foreground">
                      {booking.hotel?.name || 'Hotel'} - {bookingRoom.room.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bookingRoom.quantity} {bookingRoom.quantity > 1 ? 'rooms' : 'room'} •
                      {booking.checkIn && booking.checkOut ? 
                        ` ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}` : 
                        ' Dates TBD'}
                    </p>
                  </div>
                  <p className="font-medium text-sm text-primary">
                    {formatCurrency(
                      parseFloat(bookingRoom.room.pricePerNight) * bookingRoom.quantity * 
                      (booking.nights || 1)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Flight items */}
      {booking && booking.bookingFlights && booking.bookingFlights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Plane className="w-4 h-4 text-primary mr-1" />
            <span className="text-sm font-medium text-card-foreground">Flights</span>
          </div>
          
          <div className="space-y-2 mb-4">
            {booking.bookingFlights.map((flight: Flight) => (
              <div key={flight.id} className="px-3 py-2 bg-muted rounded">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-sm text-card-foreground">
                      {flight.flightDetails?.originDetails?.city || flight.flightDetails?.origin} 
                      ({flight.flightDetails?.origin}) → 
                      {flight.flightDetails?.destinationDetails?.city || flight.flightDetails?.destination} 
                      ({flight.flightDetails?.destination})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flight.flightDetails?.departureTime ? formatDate(flight.flightDetails.departureTime) : 'N/A'} 
                      • {flight.flightDetails?.airlineDetails?.name || flight.flightDetails?.airline || 'N/A'}
                    </p>
                  </div>
                  <p className="font-medium text-sm text-primary">
                    {formatCurrency(flight.flightDetails?.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        
      {/* If there are no flights or rooms, or booking data isn't available yet, show placeholders */}
      {(!booking || 
        (!booking.bookingFlights || booking.bookingFlights.length === 0) && 
        (!booking.bookingRooms || booking.bookingRooms.length === 0)) && (
        <>
          {/* Hotel placeholder */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Building className="w-4 h-4 text-primary mr-1" />
              <span className="text-sm font-medium text-card-foreground">Hotel</span>
            </div>
            <div className="px-3 py-2 bg-muted rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">Grand Hotel - Deluxe Room</p>
                  <p className="text-xs text-muted-foreground">1 room • Mar 24, 2025 to Apr 24, 2025</p>
                </div>
                <p className="font-medium text-sm text-primary">$2,400.00</p>
              </div>
            </div>
          </div>

          {/* Flight placeholders */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Plane className="w-4 h-4 text-primary mr-1" />
              <span className="text-sm font-medium text-card-foreground">Flights</span>
            </div>
            
            {/* YYZ to LGW */}
            <div className="px-3 py-2 bg-muted rounded mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">Toronto (YYZ) → London (LGW)</p>
                  <p className="text-xs text-muted-foreground">Mar 24, 2025 • Air Canada</p>
                </div>
                <p className="font-medium text-sm text-primary">$843.00</p>
              </div>
            </div>
            
            {/* LGW to HND */}
            <div className="px-3 py-2 bg-muted rounded mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">London (LGW) → Tokyo (HND)</p>
                  <p className="text-xs text-muted-foreground">Mar 26, 2025 • EasyJet</p>
                </div>
                <p className="font-medium text-sm text-primary">$981.00</p>
              </div>
            </div>
            
            {/* HND to DUB */}
            <div className="px-3 py-2 bg-muted rounded mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">Tokyo (HND) → Dublin (DUB)</p>
                  <p className="text-xs text-muted-foreground">Apr 23, 2025 • ANA</p>
                </div>
                <p className="font-medium text-sm text-primary">$458.00</p>
              </div>
            </div>
            
            {/* DUB to YYZ */}
            <div className="px-3 py-2 bg-muted rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">Dublin (DUB) → Toronto (YYZ)</p>
                  <p className="text-xs text-muted-foreground">Apr 24, 2025 • Ryanair</p>
                </div>
                <p className="font-medium text-sm text-primary">$1,486.00</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Taxes & Fees */}
      <div className="flex justify-between items-center py-2 border-t border-border text-sm">
        <p className="text-muted-foreground">Taxes & Fees</p>
        <p className="text-card-foreground">
          {formatCurrency((calculateHotelCost() + calculateFlightCost()) * 0.13)}
        </p>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-2 pb-2">
        <div className="flex justify-between items-center">
          <p className="font-medium text-sm text-card-foreground">Total</p>
          <p className="font-bold text-lg text-primary">{formatCurrency(calculateTotal())}</p>
        </div>
      </div>
      
      {/* Simplified secure payment note */}
      <div className="mt-1 text-xs text-muted-foreground flex items-center">
        <CreditCard className="w-3 h-3 mr-1" />
        Your payment information is encrypted and secure
      </div>
    </div>
  );
};

export default OrderSummary;