import { useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { BookingDetails } from "@/types/booking";

export function useCancelRoom() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useUserContext();

  const cancelRoom = async (
    bookingId: string,
    roomId: string
  ): Promise<BookingDetails | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call the cancel API with the specific room ID
      const response = await fetchWithAuth("/api/bookings/cancel", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          cancelBookingRooms: [roomId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel room");
      }

      const result = await response.json();

      // Check for errors in the response
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0] || "Error during room cancellation");
      }

      return result.booking;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel room";
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    cancelRoom,
    isProcessing,
    error,
  };
}
