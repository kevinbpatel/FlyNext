'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CreateBooking from '@/components/Bookings/CreateBooking';
import BookingCard from '@/components/Bookings/BookingCard';
import { useUserContext } from '@/contexts/UserContext';

interface Booking {
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
  hotel: {
    id: string;
    name: string;
    starRating: number;
    address: string;
  } | null;
  rooms: Array<{
    id: string;
    type: string;
    quantity: number;
    pricePerNight: string;
    amenities: string[];
    totalPrice: number;
  }>;
  flights: Array<{
    id: string;
    flightId: string;
    bookingReference: string;
  }>;
  hotelCost: number;
  flightCost: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, fetchWithAuth } = useUserContext();

  // Store redirect information when authentication is needed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Store the current page for redirect after login
      sessionStorage.setItem('redirectAfterLogin', '/bookings');
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Fetching bookings...");

      // Use the new fetchWithAuth utility instead of direct fetch
      const response = await fetchWithAuth('/api/bookings/view', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Bookings data:", data);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err instanceof Error && err.message.includes('Not authenticated')) {
        // If the error is related to authentication, redirect to login
        sessionStorage.setItem('redirectAfterLogin', '/bookings');
        router.push('/login');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load your bookings. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingCreated = () => {
    fetchBookings();
    setIsCreateModalOpen(false);
  };

  const navigateToBooking = (id: string) => {
    router.push(`/bookings/${id}`);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Bookings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your travel plans and itineraries
        </p>
      </div>

      {/* Bookings list */}
      <div className="space-y-4 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {/* Use the BookingCard component for each booking */}
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                {...booking}
                onClick={() => navigateToBooking(booking.id)}
              />
            ))}

            {bookings.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>You don't have any bookings yet.</p>
                <p className="mt-1">Click "Create New Booking" to get started.</p>
              </div>
            )}

            {/* Create booking card */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-dashed border-border rounded-lg p-3 flex items-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all duration-200 order-last mt-4"
            >
              <Plus className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-primary font-medium">Create New Booking</p>
                <p className="text-muted-foreground text-sm">Start planning your next trip</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create booking modal */}
      {isCreateModalOpen && (
        <CreateBooking
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}