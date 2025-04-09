import { useState } from "react";

export const useRoomActions = (
  onRemoveRoom: (roomId: string) => Promise<void>
) => {
  const [removingRoomId, setRemovingRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveRoom = async (roomId: string) => {
    try {
      setRemovingRoomId(roomId);
      setError(null);
      await onRemoveRoom(roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove room");
    } finally {
      setRemovingRoomId(null);
    }
  };

  return {
    removingRoomId,
    error,
    handleRemoveRoom,
  };
};
