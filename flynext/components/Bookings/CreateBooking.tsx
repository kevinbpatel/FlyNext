'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';

interface CreateBookingProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

const CreateBooking = ({ isOpen, onClose, onBookingCreated }: CreateBookingProps) => {
  const [bookingName, setBookingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authLoading, refreshToken } = useUserContext();

  // Check authentication status when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Close the modal if user is not authenticated
      onClose();
    }
  }, [isAuthenticated, authLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!bookingName.trim()) {
        throw new Error('Booking name is required');
      }

      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      // Using the cart/create endpoint
      const response = await fetch('/api/bookings/cart/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: bookingName }),
      });

      // Handle token expiration
      if (response.status === 401) {
        // Try to refresh the token
        await refreshToken();
        
        // Get the new token
        const newToken = localStorage.getItem("accessToken");
        if (!newToken) {
          throw new Error("Authentication failed. Please log in again.");
        }
        
        // Retry the request with the new token
        const retryResponse = await fetch('/api/bookings/cart/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ name: bookingName }),
        });
        
        if (!retryResponse.ok) {
          const data = await retryResponse.json();
          throw new Error(data.error || 'Failed to create booking');
        }
      } else if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      setBookingName('');
      onBookingCreated();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Create New Booking</h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <div className="relative border border-border rounded-lg">
              <label
                htmlFor="bookingName"
                className="absolute top-1 left-3 text-muted-foreground text-xs"
              >
                Booking Name
              </label>
              <input
                type="text"
                id="bookingName"
                name="bookingName"
                className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="e.g., Trip to Paris, Business Trip to NYC"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center space-x-1 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Booking</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;