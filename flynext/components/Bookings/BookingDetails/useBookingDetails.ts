import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingDetails, PageParams } from '@/types/booking';
import { use } from 'react';

interface UseBookingDetailsOptions {
  apiEndpoint?: string;
}

/**
 * Hook to fetch and manage booking details
 * @param params - The route params containing booking ID
 * @param fetchWithAuth - Auth-enabled fetch function from UserContext
 * @param isAuthenticated - Authentication status
 * @param isAuthLoading - Authentication loading status
 * @param options - Additional options (apiEndpoint)
 */
export function useBookingDetails(
  params: PageParams | Promise<PageParams>,
  fetchWithAuth: any,
  isAuthenticated: boolean,
  isAuthLoading: boolean,
  options: UseBookingDetailsOptions = {}
) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Default API endpoint
  const apiEndpoint = options.apiEndpoint || '/api/bookings/cart';

  // Extract the ID from params (handling Promise vs. Object)
  const bookingId = typeof params === 'object' && !('then' in params)
    ? params.id
    : use(params as Promise<PageParams>).id;

  /**
   * Fetch booking details from the API
   */
  const fetchBookingDetails = async () => {
    if (!bookingId || !isAuthenticated || isAuthLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth(`${apiEndpoint}/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking details');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      if (err instanceof Error && err.message.includes('Not authenticated')) {
        sessionStorage.setItem('redirectAfterLogin', `/bookings/${bookingId}`);
        router.push('/login');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load booking details. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch booking details when authenticated
  useEffect(() => {
    if (bookingId && isAuthenticated && !isAuthLoading) {
      fetchBookingDetails();
    }
  }, [bookingId, isAuthenticated, isAuthLoading]);

  return {
    booking,
    bookingId,
    isLoading,
    error,
    setBooking,
    setError,
    fetchBookingDetails
  };
}