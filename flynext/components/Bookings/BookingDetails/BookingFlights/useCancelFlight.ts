import { useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { BookingDetails, Flight } from '@/types/booking';

export function useCancelFlight() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useUserContext();

  const cancelFlight = async (bookingId: string, flightIdOrAll: string): Promise<BookingDetails | null> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // If flightIdOrAll is 'all', cancel the entire booking
      if (flightIdOrAll === 'all') {
        const response = await fetchWithAuth('/api/bookings/cancel', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookingId,
            cancelAll: true
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel booking');
        }

        const result = await response.json();
        return result.booking;
      } 
      
      // First, we need to get the current booking to find the booking reference
      const bookingResponse = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'GET'
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const bookingData = await bookingResponse.json();
      const flights: Flight[] = bookingData.booking.bookingFlights;
      
      // Find the flight by ID
      const flightToCancel = flights.find(flight => flight.id === flightIdOrAll);
      
      if (!flightToCancel) {
        throw new Error('Flight not found in booking');
      }

      // Check if the flight has a booking reference
      if (!flightToCancel.bookingReference) {
        throw new Error('Cannot cancel flight: no booking reference found');
      }
      
      // Now cancel the booking reference
      const response = await fetchWithAuth('/api/bookings/cancel', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          cancelBookingReferences: [flightToCancel.bookingReference]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel flight');
      }

      const result = await response.json();
      
      // Check for errors in the response
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0] || 'Error during flight cancellation');
      }
      
      return result.booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel flight';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    cancelFlight,
    isProcessing,
    error
  };
}