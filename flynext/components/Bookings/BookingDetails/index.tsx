"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

// Import hooks
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useBookingDetails } from "@/components/Bookings/BookingDetails/useBookingDetails";
import { useCancelFlight } from "@/components/Bookings/BookingDetails/BookingFlights/useCancelFlight";
import { useFlightVerification } from "@/components/Bookings/BookingDetails/BookingFlights/useFlightVerification";

// Import components
import BookingSummary from "./BookingSummary";
import BookingRooms from "./BookingRooms";
import BookingFlights from "./BookingFlights";
import BookingHeader from "./BookingHeader";

// Import types and utils
import { BookingDetailsPageProps } from "./types";
import {
  formatCurrency,
  calculateHotelCost,
  calculateFlightCost,
  calculateTotal,
  formatDate,
} from "./utils";

const BookingDetailsPage: React.FC<BookingDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [cancelingFlightId, setCancelingFlightId] = useState<string | null>(
    null
  );

  const {
    isAuthenticated,
    isLoading: authLoading,
    fetchWithAuth,
  } = useAuthRedirect(
    `/bookings/${
      typeof params === "object" && !("then" in params) ? params.id : ""
    }`
  );

  // Get booking details
  const { booking, setBooking, bookingId, isLoading, error } =
    useBookingDetails(params, fetchWithAuth, isAuthenticated, authLoading);

  // Use the flight verification hook
  const {
    flightVerifications,
    isVerifying,
    verificationError,
    verifyFlights,
    verificationData,
  } = useFlightVerification(bookingId, fetchWithAuth, isAuthenticated);

  const {
    cancelFlight,
    isProcessing: isCancelingFlight,
    error: cancelError,
  } = useCancelFlight();

  // Handle flight cancellation
  const handleCancelFlight = async (optionOrReference: string) => {
    if (!booking) {
      console.error("Cannot cancel flights: booking is null");
      return;
    }

    try {
      setCancelingFlightId(optionOrReference); // For UI state

      // Call the API to cancel the booking or booking reference
      const updatedBooking = await cancelFlight(booking.id, optionOrReference);

      if (updatedBooking) {
        // Update the booking state with the response from the API
        setBooking(updatedBooking);

        // Verify flights after cancellation
        verifyFlights();
      }
    } catch (error) {
      console.error("Error canceling flights:", error);
    } finally {
      setCancelingFlightId(null);
    }
  };

  // Function to handle flight removal
  const handleRemoveFlight = async (flightId: string) => {
    if (!booking || isRemoving) return;
    setIsRemoving(true);

    try {
      const response = await fetchWithAuth("/api/bookings/cart/remove-item", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          itemId: flightId,
          type: "flight",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove flight");
      }

      // Update the local state by removing the flight
      setBooking((prevBooking) => {
        if (!prevBooking) return null;

        return {
          ...prevBooking,
          bookingFlights: prevBooking.bookingFlights.filter(
            (flight) => flight.id !== flightId
          ),
        };
      });

      console.log("Flight removed successfully");
    } catch (err) {
      console.error("Error removing flight:", err);
      throw err; // Re-throw to be handled by the component
    } finally {
      setIsRemoving(false);
    }
  };

  // Check if any flights are confirmed (for verify button visibility)
  const hasVerifiableFlights =
    booking?.bookingFlights.some((flight) => flight.status === "confirmed") ||
    false;

  return (
    <div className="container mx-auto py-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/bookings")}
        className="flex items-center text-primary hover:text-primary/80 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to bookings
      </button>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : booking ? (
        <>
          {/* Using the BookingHeader component */}
          <BookingHeader
            booking={booking}
            formatDate={formatDate}
            hasVerifiableFlights={hasVerifiableFlights}
            verifyFlights={verifyFlights}
            isVerifying={isVerifying}
            verificationData={verificationData}
          />

          {/* Main content in grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - 2/3 width on large screens */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flights section */}
              <BookingFlights
                flights={booking.bookingFlights}
                formatCurrency={formatCurrency}
                bookingId={booking.id}
                onRemoveFlight={handleRemoveFlight}
                onCancelFlight={handleCancelFlight}
                cancelingFlightId={cancelingFlightId}
                bookingStatus={booking.status}
                flightVerifications={flightVerifications}
                isVerifying={isVerifying}
                verificationTimestamp={verificationData?.verificationTimestamp}
              />

              {/* Hotel and Rooms section */}
              {booking.hotel && (
                <BookingRooms
                  booking={booking}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  setBooking={setBooking}
                />
              )}
            </div>

            {/* Right column - 1/3 width on large screens */}
            <div className="lg:col-span-1">
              <BookingSummary
                bookingId={booking.id}
                bookingFlightsLength={booking.bookingFlights.length}
                bookingRoomsLength={booking.bookingRooms?.length || 0}
                paymentStatus={booking.paymentStatus}
                calculateHotelCost={() => calculateHotelCost(booking)}
                calculateFlightCost={() => calculateFlightCost(booking)}
                calculateTotal={() => calculateTotal(booking)}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      )}
    </div>
  );
};

// Export the main component as default
export default BookingDetailsPage;