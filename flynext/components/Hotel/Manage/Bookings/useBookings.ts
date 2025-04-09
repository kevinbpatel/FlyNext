"use client";

import { useState } from "react";
import { Booking } from "./types";
import { RoomType } from "./types";

interface UseBookingsProps {
  hotelId: string;
  fetchWithAuth: any;
}

export function useBookings({ hotelId, fetchWithAuth }: UseBookingsProps) {
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch room types - now correctly using path parameters
      const roomTypesResponse = await fetchWithAuth(`/api/hotels/${hotelId}/rooms`, {
        method: "GET",
      });
      
      if (roomTypesResponse.ok) {
        const roomTypesData = await roomTypesResponse.json();
        setRoomTypes(roomTypesData.roomTypes || []);
      } else {
        console.error("Error fetching room types:", roomTypesResponse.statusText);
      }
      
      // Fetch bookings - now correctly using path parameters
      const bookingsResponse = await fetchWithAuth(`/api/hotels/${hotelId}/bookings`, {
        method: "GET",
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
        setFilteredBookings(bookingsData.bookings || []);
      } else {
        // Try to get more detailed error info
        try {
          const errorData = await bookingsResponse.json();
          console.error("Error fetching bookings:", errorData.message || bookingsResponse.statusText);
        } catch (e) {
          console.error("Error fetching bookings:", bookingsResponse.statusText);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Using the correct path parameters for the cancel endpoint
      const response = await fetchWithAuth(`/api/hotels/${hotelId}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      
      if (response.ok) {
        // Update the booking status in the local state
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
        );
        setBookings(updatedBookings);
        setFilteredBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
          )
        );
      } else {
        // Try to get more detailed error info
        try {
          const errorData = await response.json();
          console.error("Error cancelling booking:", errorData.message || response.statusText);
        } catch (e) {
          console.error("Error cancelling booking:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return {
    bookings,
    setBookings,
    roomTypes,
    filteredBookings,
    setFilteredBookings,
    loading,
    handleCancelBooking,
    fetchData,
  };
}