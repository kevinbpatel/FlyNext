import React, { useState } from "react";
import { Building, Calendar, Loader2 } from "lucide-react";
import Image from "next/image";
import { BookingRoomsProps } from "../types";
import { formatAddress } from "../utils";
import RoomCard from "./RoomCard";
import { useRoomActions } from "./useRoomActions";
import { useCancelRoom } from "./useCancelRoom";
import { useUserContext } from "@/contexts/UserContext";

const BookingRooms: React.FC<BookingRoomsProps> = ({
  booking,
  formatCurrency,
  formatDate,
  setBooking,
}) => {
  const { fetchWithAuth } = useUserContext();
  const [cancelingRoomId, setCancelingRoomId] = useState<string | null>(null);

  // Room cancellation hook
  const {
    cancelRoom,
    isProcessing: isCancelingRoom,
    error: cancelError,
  } = useCancelRoom();

  // Handle room removal from cart
  const handleRemoveRoom = async (roomId: string) => {
    if (!booking || !roomId) {
      console.error("Cannot remove room: booking is null or roomId is missing");
      return;
    }

    try {
      const response = await fetchWithAuth("/api/bookings/cart/remove-item", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          itemId: roomId,
          type: "room",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove room");
      }

      // Update the local state by removing the room - using type assertion
      setBooking((prevBooking: any) => {
        if (!prevBooking) return null;

        return {
          ...prevBooking,
          bookingRooms: prevBooking.bookingRooms.filter(
            (room: any) => room.id !== roomId
          ),
        };
      });
    } catch (err) {
      console.error("Error removing room:", err);
      throw err;
    }
  };

  // Use the room actions hook
  const {
    removingRoomId,
    error,
    handleRemoveRoom: handleRemoveRoomAction,
  } = useRoomActions(handleRemoveRoom);

  // Handle room cancellation
  const handleCancelRoom = async (roomId: string) => {
    if (!booking) {
      console.error("Cannot cancel room: booking is null");
      return;
    }

    try {
      setCancelingRoomId(roomId);

      // Call the API to cancel the room
      const updatedBooking = await cancelRoom(booking.id, roomId);

      // Update the booking state with the response
      if (updatedBooking) {
        setBooking(updatedBooking);
      }
    } catch (error) {
      console.error("Error canceling room:", error);
    } finally {
      setCancelingRoomId(null);
    }
  };

  // Check if all rooms are canceled
  const roomsWithStatus = booking.bookingRooms.filter(
    (room: any) => room.status !== undefined
  );
  const allRoomsCanceled =
    roomsWithStatus.length > 0 &&
    roomsWithStatus.every(
      (bookingRoom: any) => bookingRoom.status?.toLowerCase() === "canceled"
    );

  if (!booking.hotel) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div
        className={`px-6 py-4 border-b ${
          allRoomsCanceled
            ? "bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
            : "bg-muted border-border"
        }`}
      >
        <div className="flex items-center">
          <Building
            className={`w-5 h-5 ${
              allRoomsCanceled ? "text-red-500 dark:text-red-400" : "text-primary"
            } mr-2`}
          />
          <h2
            className={`text-xl font-medium ${
              allRoomsCanceled ? "text-red-800 dark:text-red-300" : "text-card-foreground"
            }`}
          >
            Hotel
            {allRoomsCanceled && (
              <span className="ml-2 text-sm font-normal">(Canceled)</span>
            )}
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-6 py-3 border-b border-red-200 dark:border-red-800/30">
          {error}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start mb-4">
          {/* Hotel Logo or Fallback Building Icon */}
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 overflow-hidden">
            {booking.hotel.logo ? (
              <Image
                src={booking.hotel.logo}
                alt={`${booking.hotel.name} logo`}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <Building className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-card-foreground">{booking.hotel.name}</h3>
            <p className="text-muted-foreground">
              {formatAddress(booking.hotel.address)}
            </p>
            <p className="text-yellow-500 dark:text-yellow-400 mt-1">
              {Array(booking.hotel.starRating).fill("★").join("")}
            </p>

            {booking.checkIn && booking.checkOut && (
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                  <span className="ml-2 text-primary font-medium">
                    ({booking.nights}{" "}
                    {booking.nights === 1 ? "night" : "nights"})
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rooms List */}
        {booking.bookingRooms.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-card-foreground">Rooms</h4>
            <div className="divide-y divide-border border border-border rounded-lg">
              {booking.bookingRooms.map((bookingRoom: any, index: number) => (
                <RoomCard
                  key={bookingRoom.id || `room-${bookingRoom.room.id}-${index}`}
                  bookingRoom={bookingRoom}
                  formatCurrency={formatCurrency}
                  bookingStatus={booking.status}
                  removingRoomId={removingRoomId}
                  handleRemoveRoom={handleRemoveRoomAction}
                  cancelingRoomId={cancelingRoomId}
                  onCancelRoom={
                    booking.status === "confirmed"
                      ? handleCancelRoom
                      : undefined
                  }
                  nights={booking.nights || 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer for all-cancel option */}
      {allRoomsCanceled ? (
        <div className="bg-red-100/50 dark:bg-red-900/20 px-6 py-4 border-t border-red-200 dark:border-red-800/30 flex justify-center">
          <div className="text-red-600 dark:text-red-300 font-medium">ALL ROOMS CANCELED</div>
        </div>
      ) : (
        booking.status?.toLowerCase() === "confirmed" &&
        booking.bookingRooms.some(
          (room: any) => room.status?.toLowerCase() !== "canceled"
        ) && (
          <div className="bg-muted px-6 py-4 border-t border-border flex justify-end">
            <button
              onClick={() => handleCancelRoom("all")}
              disabled={!!cancelingRoomId}
              className={`flex items-center text-sm font-medium ${
                cancelingRoomId
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
              }`}
            >
              {cancelingRoomId === "all" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Canceling all rooms...
                </>
              ) : (
                "Cancel All Rooms"
              )}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default BookingRooms;