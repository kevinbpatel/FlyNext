'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  PlaneTakeoff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Booking {
  id: string;
  name: string;
  status: string;
  rooms: Array<{
    id: string;
    type: string;
    quantity: number;
  }>;
  hotel: {
    id: string;
    name: string;
  } | null;
  // Other booking properties
}

function HotelBookingConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, refreshToken } = useUserContext();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get parameters from URL
  const bookingId = searchParams.get('bookingId');
  const bookingName = searchParams.get('bookingName') || 'your booking';
  const roomType = searchParams.get('roomType') || 'room';
  const nights = searchParams.get('nights') || '0';
  const quantity = searchParams.get('quantity') || '1';
  const hotelName = searchParams.get('hotelName') || 'the hotel';

  const to = searchParams.get('to');
  const toFull = searchParams.get('toFull');
  const departureDate = searchParams.get('DateIn');
  let returnDate = searchParams.get('Dateout');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }

      if (bookingId) {
        fetchBookingDetails(bookingId);
      } else {
        setError('Booking ID is missing');
        setIsLoading(false);
      }
    }
  }, [bookingId, isAuthenticated, authLoading]);

  const fetchBookingDetails = async (id: string) => {
    setIsLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      // Fetch booking details
      const response = await fetch(`/api/bookings/cart/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Handle token expiration
      if (response.status === 401) {
        await refreshToken();
        
        const newToken = localStorage.getItem("accessToken");
        if (!newToken) {
          throw new Error("Authentication failed. Please log in again.");
        }
        
        const retryResponse = await fetch(`/api/bookings/cart/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (!retryResponse.ok) {
          const data = await retryResponse.json();
          throw new Error(data.error || 'Failed to fetch booking details');
        }

        const data = await retryResponse.json();
        setBooking(data.booking);
      } else if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch booking details');
      } else {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomCount = () => {
    if (!booking || !booking.rooms) return 0;
    return booking.rooms.length;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium text-foreground">Loading booking details</h3>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success state */}
      {!isLoading && !error && (
        <div className="max-w-3xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Room Added Successfully</h1>
            <p className="text-muted-foreground text-lg">
              Your selected room has been added to <span className="font-medium">{decodeURIComponent(bookingName)}</span>
            </p>
          </div>

          {/* Booking summary */}
          <div className="bg-card rounded-lg shadow-md border border-border p-6 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Booking Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Booking Name</span>
                <span className="font-medium text-card-foreground">{decodeURIComponent(bookingName)}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Hotel</span>
                <span className="font-medium text-card-foreground">{decodeURIComponent(hotelName)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Room Type</span>
                <span className="font-medium text-card-foreground">{decodeURIComponent(roomType)}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium text-card-foreground">{quantity} room{parseInt(quantity) !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground">Stay Duration</span>
                <span className="font-medium text-card-foreground">{nights} night{parseInt(nights) !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="status-badge status-badge-pending">
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* Flight suggestion */}
          <div className="bg-secondary/20 dark:bg-secondary/10 rounded-lg p-6 border border-secondary/30 dark:border-secondary/20 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <PlaneTakeoff className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Need flights for your trip?</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your travel plans by adding flights to your booking. We have great options available for your destination.
                </p>
                <Button 
                  onClick={() => {
                    const url =
                      to && toFull && departureDate
                        ? `/flights?from=&fromFull=&to=${to}&toFull=${toFull}&departureDate=${departureDate}&returnDate=${returnDate}&tripType=round-trip&travelers=1`
                        : `/flights?to=${to}&toFull=${toFull}&departureDate=${departureDate}`;
                    router.push(url);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
                >
                  Browse Flights
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/bookings/${bookingId}`)}
              className="border-border text-foreground hover:bg-accent/10"
            >
              View Booking Details
            </Button>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/hotels')}
                className="border-primary text-primary hover:bg-primary/10 dark:border-primary/70 dark:text-primary/90"
              >
                Continue Shopping
              </Button>
              
              <Button
                onClick={() => router.push(`/bookings/checkout/${bookingId}`)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the component wrapped in a Suspense boundary
export default function HotelBookingConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading hotel booking confirmation...</div>}>
      <HotelBookingConfirmationPageContent />
    </Suspense>
  );
}
