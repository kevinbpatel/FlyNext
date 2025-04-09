import React, { useEffect } from 'react';
import { Plane, Loader2 } from 'lucide-react';
import { BookingFlightsProps } from '../types';
import FlightCard from './FlightCard';
import { useFlightActions } from './useFlightActions';

const BookingFlights: React.FC<BookingFlightsProps> = ({
  flights,
  formatCurrency,
  bookingId,
  onRemoveFlight,
  onCancelFlight,
  cancelingFlightId,
  bookingStatus = '',
  flightVerifications = {},
  isVerifying = false,
  verificationTimestamp
}) => {
  const { 
    error, 
    removingFlightId,
    handleRemoveFlight 
  } = useFlightActions(onRemoveFlight);

  // Debug logging when verification data changes
  useEffect(() => {
    console.log('📊 BookingFlights received flightVerifications:', flightVerifications);
    console.log('🔄 isVerifying state:', isVerifying);
    console.log('🕒 verificationTimestamp:', verificationTimestamp);

    // Log each flight's verification status
    flights.forEach(flight => {
      const verification = flightVerifications[flight.flightId];
      console.log(`🛫 Flight ${flight.flightId} verification:`, verification || 'No verification data');
    });
  }, [flights, flightVerifications, isVerifying, verificationTimestamp]);

  if (!flights || flights.length === 0) {
    return null;
  }

  // Get the booking reference from the first confirmed flight (if available)
  const bookingReference = flights.find(flight => 
    flight.status?.toLowerCase() === 'confirmed' || 
    flight.status?.toLowerCase() === 'canceled')?.bookingReference;

  // Check if all flights are canceled
  const allFlightsCanceled = flights.length > 0 && 
    flights.every(flight => flight.status?.toLowerCase() === 'canceled');

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${allFlightsCanceled ? 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30' : 'bg-muted border-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Plane className={`w-5 h-5 ${allFlightsCanceled ? 'text-red-500 dark:text-red-400' : 'text-primary'} mr-2`} />
            <h2 className={`text-xl font-medium ${allFlightsCanceled ? 'text-red-800 dark:text-red-300' : 'text-card-foreground'}`}>
              Flights
              {allFlightsCanceled && <span className="ml-2 text-sm font-normal">(Canceled)</span>}
            </h2>
          </div>
          {bookingReference && (bookingStatus === 'confirmed' || bookingStatus === 'canceled') && (
            <div className="text-sm text-muted-foreground">
              Booking Reference: <span className="font-medium">{bookingReference}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-6 py-3 border-b border-red-200 dark:border-red-800/30">
          {error}
        </div>
      )}

      <div className="divide-y divide-border">
        {flights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            formatCurrency={formatCurrency}
            bookingStatus={bookingStatus}
            removingFlightId={removingFlightId}
            handleRemoveFlight={handleRemoveFlight}
            flightVerifications={flightVerifications}
            isVerifying={isVerifying}
          />
        ))}
      </div>

      {/* Footer */}
      {allFlightsCanceled ? (
        <div className="bg-red-100/50 dark:bg-red-900/20 px-6 py-4 border-t border-red-200 dark:border-red-800/30 flex justify-center">
          <div className="text-red-600 dark:text-red-300 font-medium">BOOKING CANCELED</div>
        </div>
      ) : (
        bookingStatus?.toLowerCase() === 'confirmed' && 
        flights.some(flight => flight.status?.toLowerCase() !== 'canceled') && (
          <div className="bg-muted px-6 py-4 border-t border-border flex justify-end">
            <button
              onClick={() => onCancelFlight('all')}
              disabled={!!cancelingFlightId}
              className={`flex items-center text-sm font-medium ${cancelingFlightId
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'
                }`}
            >
              {cancelingFlightId === 'all' ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default BookingFlights;