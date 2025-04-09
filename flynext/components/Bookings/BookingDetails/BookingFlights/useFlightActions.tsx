import { useState } from 'react';

export const useFlightActions = (onRemoveFlight: (flightId: string) => Promise<void>) => {
  const [removingFlightId, setRemovingFlightId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveFlight = async (flightId: string) => {
    try {
      setRemovingFlightId(flightId);
      setError(null);
      await onRemoveFlight(flightId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove flight');
    } finally {
      setRemovingFlightId(null);
    }
  };

  return {
    removingFlightId,
    error,
    handleRemoveFlight
  };
};