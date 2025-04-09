"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingsStats } from "./BookingsStats";
import { BookingsFilters } from "./BookingsFilters";
import { BookingsTable } from "./BookingsTable";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { useBookings } from "@/components/Hotel/Manage/Bookings/useBookings";
import { useBookingsFilters } from "@/components/Hotel/Manage/Bookings/useBookingFilters";
import { BookingsProps } from "./types";

export default function Bookings({ hotelId, fetchWithAuth }: BookingsProps) {
  const {
    bookings,
    filteredBookings,
    setFilteredBookings,
    roomTypes,
    loading,
    handleCancelBooking,
    fetchData,
  } = useBookings({ hotelId, fetchWithAuth });
  
  const {
    roomTypeFilter,
    selectedDate,
    setRoomTypeFilter,
    setSelectedDate,
    applyFilters,
    clearFilters,
  } = useBookingsFilters(bookings);
  
  // Cancellation dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  
  // Fetch bookings and room types on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    const filtered = applyFilters(bookings);
    setFilteredBookings(filtered);
  }, [bookings, roomTypeFilter, selectedDate]);

  const openCancelDialog = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    await handleCancelBooking(bookingToCancel);
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  // Booking count summaries
  const totalBookings = filteredBookings.length;
  const confirmedBookings = filteredBookings.filter(b => b.status === "confirmed").length;
  const cancelledBookings = filteredBookings.filter(b => b.status === "cancelled").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Bookings</h2>
      </div>

      <BookingsStats 
        totalBookings={totalBookings}
        confirmedBookings={confirmedBookings}
        cancelledBookings={cancelledBookings}
      />

      <BookingsFilters
        roomTypes={roomTypes}
        roomTypeFilter={roomTypeFilter}
        selectedDate={selectedDate}
        setRoomTypeFilter={setRoomTypeFilter}
        setSelectedDate={setSelectedDate}
        clearFilters={clearFilters}
      />

      <BookingsTable
        filteredBookings={filteredBookings}
        openCancelDialog={openCancelDialog}
      />

      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={confirmCancelBooking}
      />
    </div>
  );
}