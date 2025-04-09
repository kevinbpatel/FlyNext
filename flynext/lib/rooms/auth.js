import prisma from "@/utils/db";

/**
 * Check if a hotel exists and belongs to the user
 * @param {string} hotelId - The hotel ID
 * @param {string} userId - The authenticated user ID
 * @returns {Promise<{hotel: object|null, error: object|null}>}
 */
export async function checkHotelOwnership(hotelId, userId) {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return { 
        hotel: null, 
        error: { 
          message: "Hotel not found", 
          status: 404 
        } 
      };
    }

    if (hotel.ownerId !== userId) {
      return { 
        hotel: null, 
        error: { 
          message: "Forbidden: You are not the owner of this hotel", 
          status: 403 
        } 
      };
    }

    return { hotel, error: null };
  } catch (error) {
    return { 
      hotel: null, 
      error: { 
        message: "Error checking hotel ownership", 
        error: error.message, 
        status: 500 
      } 
    };
  }
}

/**
 * Check if a room exists and belongs to the user's hotel
 * @param {string} roomId - The room ID
 * @param {string} hotelId - The hotel ID
 * @param {string} userId - The authenticated user ID
 * @param {boolean} includeBookings - Whether to include booking information
 * @returns {Promise<{room: object|null, error: object|null}>}
 */
export async function checkRoomAccess(roomId, hotelId, userId, includeBookings = false) {
  try {
    const include = {
      hotel: true,
    };

    if (includeBookings) {
      include.bookingRooms = {
        include: { booking: true }
      };
    }

    const room = await prisma.room.findUnique({
      where: { 
        id: roomId,
        hotelId: hotelId 
      },
      include,
    });

    if (!room) {
      return { 
        room: null, 
        error: { 
          message: "Room not found", 
          status: 404 
        } 
      };
    }

    if (room.hotel.ownerId !== userId) {
      return { 
        room: null, 
        error: { 
          message: "Forbidden: You are not the owner of this hotel", 
          status: 403 
        } 
      };
    }

    return { room, error: null };
  } catch (error) {
    return { 
      room: null, 
      error: { 
        message: "Error checking room access", 
        error: error.message, 
        status: 500 
      } 
    };
  }
}