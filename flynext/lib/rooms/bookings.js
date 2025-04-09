import prisma from "@/utils/db";

/**
 * Calculate the maximum number of rooms booked on any day for a room
 * @param {Array} bookingRooms - The booking rooms data
 * @returns {number} The maximum number of rooms booked
 */
export function calculateMaxBookedRooms(bookingRooms) {
  const dailyBookings = {};
  
  if (!bookingRooms || bookingRooms.length === 0) {
    return 0;
  }
  
  bookingRooms.forEach((bookingRoom) => {
    if (bookingRoom.booking && 
        bookingRoom.booking.checkIn && 
        bookingRoom.booking.checkOut) {
      
      const checkInDate = new Date(bookingRoom.booking.checkIn);
      const checkOutDate = new Date(bookingRoom.booking.checkOut);
      const quantity = bookingRoom.quantity || 1;
      
      let currentDate = new Date(checkInDate);
      
      while (currentDate < checkOutDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        dailyBookings[dateKey] = (dailyBookings[dateKey] || 0) + quantity;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  const bookingValues = Object.values(dailyBookings);
  return bookingValues.length > 0 ? Math.max(...bookingValues) : 0;
}

/**
 * Check if a room has active bookings
 * @param {string} roomId - The room ID
 * @returns {Promise<{hasActiveBookings: boolean, count: number, error: object|null}>}
 */
export async function checkActiveBookings(roomId) {
  try {
    const bookingRooms = await prisma.bookingRoom.findMany({
      where: { roomId },
      include: { booking: true }
    });
    
    const activeBookings = bookingRooms.filter(br => {
      if (!br.booking) return false;
      // Consider a booking active if the checkout date is in the future
      const checkOut = new Date(br.booking.checkOut);
      return checkOut > new Date();
    });
    
    return {
       hasActiveBookings: activeBookings.length > 0,
       count: activeBookings.length,
      error: null
    };
  } catch (error) {
    return {
       hasActiveBookings: false,
       count: 0,
      error: {
        message: "Error checking active bookings",
        error: error.message
      }
    };
  }
}