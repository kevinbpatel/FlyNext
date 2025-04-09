import { Booking, RoomType } from './types';

// Function to fetch bookings
export const fetchBookings = async (refreshToken: () => Promise<void>) => {
  try {
    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    // First attempt to fetch bookings
    let response = await fetch('/api/bookings/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Handle token expiration
    if (response.status === 401) {
      await refreshToken();
      
      accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Authentication failed. Please log in again.");
      }
      
      // Retry the request with the new token
      response = await fetch('/api/bookings/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch bookings');
    }

    const data = await response.json();
    return data.bookings || [];
  } catch (error) {
    console.error('Error in fetchBookings:', error);
    throw error;
  }
};

// Function to add a room to a booking
export const addRoomToBooking = async ({
  selectedBookingId,
  selectedRoom,
  quantity,
  checkIn,
  checkOut,
  bookings
}: {
  selectedBookingId: string;
  selectedRoom: RoomType;
  quantity: number;
  checkIn: Date;
  checkOut: Date;
  bookings: Booking[];
}) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    // Prepare request body
    const requestBody = {
      bookingId: selectedBookingId,
      roomId: selectedRoom.id,
      quantity: quantity,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString()
    };

    // Send the request to add the room
    const response = await fetch('/api/bookings/cart/add-room', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add room to booking');
    }

    const data = await response.json();
    
    // Find the booking for redirection
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) {
      throw new Error('Selected booking not found');
    }

    // Calculate total nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Prepare redirect parameters
    const redirectParams = new URLSearchParams({
      bookingId: selectedBookingId,
      bookingName: encodeURIComponent(booking.name),
      roomType: encodeURIComponent(selectedRoom.type),
      nights: nights.toString(),
      quantity: quantity.toString(),
      hotelName: booking.hotel ? encodeURIComponent(booking.hotel.name) : 'Unknown Hotel'
    }).toString();

    return {
      success: true,
      redirectParams
    };
  } catch (error) {
    console.error('Error in addRoomToBooking:', error);
    throw error;
  }
};