"use client";

import { useState } from "react";
import type { Booking } from "./types";

export function useBookingsFilters(initialBookings: Booking[] = []) {
  // Filter states
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const applyFilters = (bookings: Booking[]): Booking[] => {
    let result = [...bookings];
    
    // Apply room type filter
    if (roomTypeFilter !== "all") {
      result = result.filter(booking => booking.roomType === roomTypeFilter);
    }
    
    // Apply single date filter (find bookings active on the selected date)
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      
      result = result.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        
        const checkOut = new Date(booking.checkOut);
        checkOut.setHours(0, 0, 0, 0);
        
        // If selected date is between check-in and check-out (inclusive)
        return (filterDate >= checkIn && filterDate <= checkOut);
      });
    }
    
    return result;
  };

  const clearFilters = () => {
    setRoomTypeFilter("all");
    setSelectedDate(undefined);
  };

  return {
    roomTypeFilter,
    selectedDate,
    setRoomTypeFilter,
    setSelectedDate,
    applyFilters,
    clearFilters,
  };
}