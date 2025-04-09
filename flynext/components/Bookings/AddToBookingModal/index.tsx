'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';
import CreateBooking from '../CreateBooking';
import BookingsList from './BookingsList';
import CreateNewBookingButton from './CreateNewBookingButton';
import ModalFooter from './ModalFooter';
import { fetchBookings, addFlightsToBooking } from './FlightBookingUtils';
import { addRoomToBooking } from './RoomBookingUtils';
import { AddToBookingModalProps, Booking } from './types';
import { useSearchParams } from 'next/navigation';



const AddToBookingModal = ({
  isOpen,
  onClose,
  selectedOutboundFlight,
  selectedReturnFlight,
  travelers,
  selectedRoom,
  roomQuantity,
  checkIn,
  checkOut,
  modalType
}: AddToBookingModalProps) => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const { isAuthenticated, isLoading: authLoading, refreshToken } = useUserContext();
  const searchParams = useSearchParams();


  // Fetch bookings when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && !authLoading) {
      handleFetchBookings();
    }
  }, [isOpen, isAuthenticated, authLoading]);

  // Check authentication status when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated && isOpen) {
      // Close the modal if user is not authenticated
      onClose();
    }
  }, [isAuthenticated, authLoading, onClose, isOpen]);

  if (!isOpen) return null;

  // Function to handle booking selection
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const handleFetchBookings = async () => {
    setIsLoading(true);
    setError('');

    try {
      const bookingsData = await fetchBookings(refreshToken);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemToBooking = async () => {
    if (!selectedBookingId) {
      setError('Please select a booking to add items to');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (modalType === 'flight') {
        if (!selectedOutboundFlight) {
          throw new Error('No outbound flight selected');
        }

        const result = await addFlightsToBooking({
          selectedBookingId,
          selectedOutboundFlight,
          selectedReturnFlight,
          bookings
        });

        const hotelCity = searchParams.get('to');
        const hotelcityFull = searchParams.get('toFull');
        const checkIn = searchParams.get('departureDate');
        const checkOut = searchParams.get('returnDate');

        const hotelSuggestionParams = new URLSearchParams();

        if (hotelCity) hotelSuggestionParams.set('to', hotelCity);
        if (checkIn) hotelSuggestionParams.set('checkIn', checkIn);
        if (checkOut) hotelSuggestionParams.set('checkOut', checkOut);
        if (hotelcityFull) hotelSuggestionParams.set('toFull', hotelcityFull);

        // Check for partial success
        if (result.anyPartialSuccess) {
          if (result.outboundSegmentsAdded < result.outboundSegmentsTotal) {
            console.warn(`Only ${result.outboundSegmentsAdded}/${result.outboundSegmentsTotal} outbound segments were added`);
            setError(`Warning: Only ${result.outboundSegmentsAdded} out of ${result.outboundSegmentsTotal} outbound flight segments were added.`);
          }
          
          if (result.returnSegmentsAdded < result.returnSegmentsTotal) {
            console.warn(`Only ${result.returnSegmentsAdded}/${result.returnSegmentsTotal} return segments were added`);
            if (setError) {
              setError(prev => prev 
                ? `${prev} Only ${result.returnSegmentsAdded} out of ${result.returnSegmentsTotal} return flight segments were added.` 
                : `Warning: Only ${result.returnSegmentsAdded} out of ${result.returnSegmentsTotal} return flight segments were added.`);
            }
          }
        }

        // Redirect to confirmation page
        // router.push(`/flights/booking-confirmation?${result.redirectParams}`);
        router.push(`/flights/booking-confirmation?${result.redirectParams}&${hotelSuggestionParams.toString()}`);
      } else if (modalType === 'room') {
        if (!selectedRoom || !checkIn || !checkOut || !roomQuantity) {
          throw new Error('Missing room booking details');
        }

        const hotelCity = searchParams.get('destination');
        const hotelCityFull = searchParams.get('destinationFull');
        const DateIn = searchParams.get('checkInDate');
        let  Dateout = searchParams.get('checkOutDate');

        const hotelSuggestionParams = new URLSearchParams();

        if (hotelCity) hotelSuggestionParams.set('to', hotelCity);
        if (DateIn) hotelSuggestionParams.set('DateIn', DateIn);
        if (Dateout) hotelSuggestionParams.set('Dateout', Dateout);
        if (hotelCityFull) hotelSuggestionParams.set('toFull', hotelCityFull);

          
        const result = await addRoomToBooking({
          selectedBookingId,
          selectedRoom,
          quantity: roomQuantity,
          checkIn,
          checkOut,
          bookings
        });

        // Redirect to confirmation page
        router.push(`/hotels/booking-confirmation?${result.redirectParams}&${hotelSuggestionParams.toString()}`);
      }
    } catch (err) {
      console.error('Error adding item to booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to booking');
      setIsSubmitting(false);
    }
  };

  const handleCreateBookingSuccess = async () => {
    setShowCreateBooking(false);
    await handleFetchBookings();
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-card rounded-lg w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center p-5 border-b border-border">
            <h3 className="text-lg font-medium text-card-foreground">Select a Booking</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <p className="text-muted-foreground mb-4">
              Choose a booking to add your selected {modalType === 'flight' ? 'flights' : 'room'} to, or create a new booking.
            </p>

            <div className="space-y-3">
              <BookingsList
                bookings={bookings}
                selectedBookingId={selectedBookingId}
                onSelectBooking={handleSelectBooking}
                isLoading={isLoading}
              />

              {!isLoading && (
                <CreateNewBookingButton onClick={() => setShowCreateBooking(true)} />
              )}
            </div>

            <ModalFooter
              onClose={onClose}
              onConfirm={handleAddItemToBooking}
              isSubmitting={isSubmitting}
              isConfirmDisabled={!selectedBookingId}
            />
          </div>
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateBooking && (
        <CreateBooking
          isOpen={showCreateBooking}
          onClose={() => setShowCreateBooking(false)}
          onBookingCreated={handleCreateBookingSuccess}
        />
      )}
    </>
  );
};

export default AddToBookingModal;