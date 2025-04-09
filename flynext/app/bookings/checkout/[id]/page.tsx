'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';
import { use } from 'react';
import { BookingDetails, BookingRoom, Flight, PageParams } from '@/types/booking';
import PassengerInformation from '@/components/Checkout/PassengerInformation';
import PaymentInformation from '@/components/Checkout/PaymentInformation';
import OrderSummary from '@/components/Checkout/OrderSummary';
import { formatCurrency, calculateHotelCost, calculateFlightCost, calculateTotal } from '@/utils/bookingCalculations';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useBookingDetails } from '@/components/Bookings/BookingDetails/useBookingDetails';
import { usePaymentForm } from '@/hooks/usePaymentForm';

// Payment form data interface
interface PaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    passportNumber: string;
    dateOfBirth: string;
  }
}

interface CheckoutPageProps {
  params: PageParams; // | Promise<PageParams>;
}

export default function CheckoutPage() {

  const router = useRouter();
  const params = useParams();
  // Normalize the id to a string.
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // If no id is present, display a loading state.
  if (!id) {
    return <div>Loading...</div>;
  }
  
  const [bookingReference, setBookingReference] = useState('');

  // Authentication redirect
  const { isAuthenticated, isLoading: authLoading, fetchWithAuth } = 
    useAuthRedirect(`/checkout/${typeof params === 'object' && !('then' in params) ? params.id : ''}`);
  
  // Get booking details
  const { 
    booking, 
    bookingId, 
    isLoading, 
    error: bookingError 
  } = useBookingDetails({ id }, fetchWithAuth, isAuthenticated, authLoading);
  
  // Payment form handling
  const {
    formData,
    formErrors,
    isSubmitting,
    error,
    successMessage,
    handleInputChange,
    handleCardNumberChange,
    handleExpiryDateChange,
    submitPaymentForm
  } = usePaymentForm();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitPaymentForm(
      fetchWithAuth, 
      bookingId,
      (data) => {
        // Navigate to confirmation page at the new path
        router.push(`/bookings/confirmation/${bookingId}`);
      }
    );
  };

  return (
    <div className="container mx-auto py-4">
      {/* Back button */}
      <button
        onClick={() => router.push(`/bookings/${bookingId}`)}
        className="flex items-center text-primary hover:text-primary/80 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to booking details
      </button>

      {/* Page title */}
      <h1 className="text-2xl font-bold text-foreground mb-4">Complete Your Booking</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      ) : successMessage ? (
        <div className="bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300 px-4 py-4 rounded-lg mb-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-1">{successMessage}</h2>
          {bookingReference && (
            <p className="mb-2">Your booking reference: <span className="font-bold">{bookingReference}</span></p>
          )}
          <p>Redirecting you to your booking details...</p>
        </div>
      ) : booking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - checkout form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Passenger Information Component */}
              <PassengerInformation
                passengerInfo={formData.passengerInfo}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
              />

              {/* Payment Information Component */}
              <PaymentInformation
                cardNumber={formData.cardNumber}
                cardholderName={formData.cardholderName}
                expiryDate={formData.expiryDate}
                cvv={formData.cvv}
                formErrors={formErrors}
                handleCardNumberChange={handleCardNumberChange}
                handleExpiryDateChange={handleExpiryDateChange}
                handleInputChange={handleInputChange}
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition duration-200 disabled:bg-primary/70 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Payment • {formatCurrency(calculateTotal(booking))}
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg flex items-start text-sm">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Right column - order summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              booking={booking}
              formatCurrency={formatCurrency}
              calculateHotelCost={() => calculateHotelCost(booking)}
              calculateFlightCost={() => calculateFlightCost(booking)}
              calculateTotal={() => calculateTotal(booking)}
            />

          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      )}
    </div>
  );
}