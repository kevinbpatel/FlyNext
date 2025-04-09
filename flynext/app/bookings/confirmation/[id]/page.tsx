'use client';

import { useState } from 'react';
import { useRouter, useParams  } from 'next/navigation';
import { 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  CreditCard, 
  Plane, 
  Hotel,
  Mail,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { formatCurrency } from '@/utils/bookingCalculations';
import { useBookingDetails } from '@/components/Bookings/BookingDetails/useBookingDetails';
import { use } from 'react';
import { BookingDetails, Flight, BookingRoom, PageParams } from '@/types/booking';

interface ConfirmationPageProps {
  params: PageParams | Promise<PageParams>;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <div>Loading...</div>;
  }

  // Use the auth redirect hook
  const { isAuthenticated, isLoading: authLoading, fetchWithAuth } = 
    useAuthRedirect(`/bookings/confirmation/${typeof params === 'object' && !('then' in params) ? params.id : ''}`);
  
  // Use the custom booking details hook with the appropriate API endpoint
  const { 
    booking: bookingData, 
    bookingId, 
    isLoading, 
    error 
  } = useBookingDetails(
    {id}, 
    fetchWithAuth, 
    isAuthenticated, 
    authLoading,
    { apiEndpoint: '/api/bookings/cart' }
  );

  // Handle view booking details button click
  const handleViewBookingDetails = () => {
    router.push(`/bookings/${bookingId}`);
  };

  // Handle download invoice button click
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadInvoice = async () => {
    if (!bookingId || isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // Use fetchWithAuth to maintain authentication
      const response = await fetchWithAuth(`/api/bookings/invoice?bookingId=${bookingId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download invoice');
      }
      
      // Get the invoice HTML content
      const invoiceHtml = await response.text();
      
      // Convert HTML to Blob
      const blob = new Blob([invoiceHtml], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${bookingReference}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto mt-12 px-4">
        <div className="bg-card rounded-lg shadow-sm border border-red-200 dark:border-red-800/30 overflow-hidden">
          <div className="bg-red-100/50 dark:bg-red-900/20 px-4 py-4 border-b border-red-200 dark:border-red-800/30">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-300">Something went wrong</h2>
          </div>
          <div className="p-4">
            <p className="text-card-foreground mb-4">{error}</p>
            <button
              onClick={() => router.push('/bookings')}
              className="w-full bg-red-600 dark:bg-red-700 text-white py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition"
            >
              Return to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return null;
  }

  const bookingReference = bookingData.bookingFlights?.[0]?.bookingReference?.toLowerCase() || bookingId;
  const hasFlights = bookingData.bookingFlights && bookingData.bookingFlights.length > 0;
  const hasHotel = bookingData.bookingRooms && bookingData.bookingRooms.length > 0;
  const formattedPrice = bookingData.totalPrice 
    ? formatCurrency(typeof bookingData.totalPrice === 'string' 
        ? parseFloat(bookingData.totalPrice) 
        : bookingData.totalPrice) 
    : 'N/A';

  return (
    <div className="container max-w-2xl mx-auto my-6 px-4">
      {/* Success Banner */}
      <div className="bg-green-100/50 dark:bg-green-900/20 rounded-t-lg py-4 px-6 flex items-center border border-green-200 dark:border-green-800/30">
        <CheckCircle className="text-green-600 dark:text-green-400 h-6 w-6 mr-3 flex-shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-card-foreground">Booking Confirmed</h1>
          <p className="text-sm text-muted-foreground">Your booking has been successfully confirmed and processed</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-b-lg shadow-sm border border-border border-t-0">
        {/* Booking Reference */}
        <div className="border-b border-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-card-foreground">{bookingReference}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold text-card-foreground">{formattedPrice}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-4 space-y-4">
          {/* Flight Section */}
          {hasFlights && (
            <div className="flex">
              <Plane className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">Flight Details</h3>
                <div className="mt-2 bg-muted rounded-md p-3 text-sm space-y-2">
                  {bookingData.bookingFlights.map((flight: Flight, index: number) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">{flight.flightDetails?.flightNumber || `Flight ${index + 1}`}</p>
                        {flight.flightDetails?.origin && flight.flightDetails?.destination && (
                          <p className="text-muted-foreground">
                            {flight.flightDetails.origin} → {flight.flightDetails.destination}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 status-badge status-badge-confirmed self-start">
                        {flight.status || 'Confirmed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hotel Section */}
          {hasHotel && (
            <div className="flex">
              <Hotel className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">Hotel Details</h3>
                <div className="mt-2 bg-muted rounded-md p-3 text-sm space-y-2">
                  {bookingData.hotel && (
                    <p className="font-medium text-card-foreground">{bookingData.hotel.name}</p>
                  )}
                  <div className="flex justify-between">
                    <div>
                      {bookingData.checkIn && bookingData.checkOut && (
                        <p className="text-muted-foreground">
                          {new Date(bookingData.checkIn).toLocaleDateString()} - {new Date(bookingData.checkOut).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        {bookingData.bookingRooms.length} {bookingData.bookingRooms.length === 1 ? 'room' : 'rooms'}
                      </p>
                    </div>
                    <span className="px-2 py-1 status-badge status-badge-confirmed self-start">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Section */}
          <div className="flex">
            <CreditCard className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">Payment Details</h3>
              <div className="mt-2 bg-muted rounded-md p-3 text-sm">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Payment Status</p>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {bookingData.paymentStatus === 'success' ? 'Completed' : bookingData.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-muted-foreground">Total Amount</p>
                  <span className="font-medium text-card-foreground">{formattedPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="flex">
            <Mail className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">What's Next?</h3>
              <div className="mt-2 text-sm text-muted-foreground space-y-1.5">
                <p>• A confirmation email has been sent to your registered email address</p>
                <p>• You can view your full booking details in the "My Bookings" section</p>
                <p>• You'll receive notifications before your travel dates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="border-t border-border p-4 space-y-3">
          <button
            onClick={handleViewBookingDetails}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition flex items-center justify-center"
          >
            View Full Booking Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
          
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="w-full bg-white border border-primary text-primary py-3 rounded-md font-medium hover:bg-primary/10 transition flex items-center justify-center dark:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}