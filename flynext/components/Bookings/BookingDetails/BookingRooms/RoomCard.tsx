import React from "react";
import { Building, Loader2 } from "lucide-react";
import { RoomCardProps } from "./types";

const RoomCard: React.FC<RoomCardProps> = ({
  bookingRoom,
  formatCurrency,
  bookingStatus = "",
  removingRoomId,
  handleRemoveRoom,
  cancelingRoomId,
  onCancelRoom,
  nights,
}) => {
  const room = bookingRoom.room;
  const roomStatus = bookingRoom.status;
  const isCanceled = roomStatus?.toLowerCase() === "canceled";
  const roomId = bookingRoom.id || "";

  // Calculate total price for this room booking
  const totalPrice =
    parseFloat(room.pricePerNight) * bookingRoom.quantity * nights;

  return (
    <div className={`p-5 relative ${isCanceled ? "bg-red-100/50 dark:bg-red-900/20" : ""}`}>
      <div className="flex justify-between">
        {/* Left side with room info */}
        <div className="flex">
          {/* Fixed circular logo with consistent dimensions */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
              isCanceled ? "bg-red-100 dark:bg-red-900/30" : "bg-primary/10"
            }`}
          >
            <Building
              className={`w-6 h-6 ${
                isCanceled ? "text-red-600 dark:text-red-400" : "text-primary"
              }`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-card-foreground">
              {room.type} ({bookingRoom.quantity})
            </h3>
            {room.amenities && room.amenities.length > 0 && (
              <p className="text-sm text-muted-foreground mb-1">
                {room.amenities.join(", ")}
              </p>
            )}
            {isCanceled && (
              <span className="status-badge status-badge-cancelled">
                Canceled
              </span>
            )}
          </div>
        </div>

        {/* Right side with price */}
        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(room.pricePerNight)} per night
            </p>
            <p
              className={`font-semibold ${
                isCanceled ? "text-muted-foreground line-through" : "text-primary"
              }`}
            >
              {formatCurrency(totalPrice)}
            </p>
          </div>

          {/* Show Remove button ONLY for pending bookings with room id */}
          {bookingStatus === "pending" && !isCanceled && roomId && (
            <button
              onClick={() => handleRemoveRoom(roomId)}
              disabled={removingRoomId === roomId || !roomId}
              className={`flex items-center text-sm font-medium ${
                removingRoomId === roomId || !roomId
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors"
              }`}
            >
              {removingRoomId === roomId ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </button>
          )}

          {/* Show Cancel button for confirmed bookings with room id */}
          {bookingStatus === "confirmed" &&
            !isCanceled &&
            onCancelRoom &&
            roomId && (
              <button
                onClick={() => onCancelRoom(roomId)}
                disabled={cancelingRoomId === roomId || !roomId}
                className={`flex items-center text-sm font-medium ${
                  cancelingRoomId === roomId || !roomId
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors"
                }`}
              >
                {cancelingRoomId === roomId ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Cancel"
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;