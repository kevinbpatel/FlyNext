/**
 * Format room data for response
 * @param {object} room - The room data from the database
 * @param {boolean} includeBookings - Whether to include booking data
 * @returns {object} Formatted room data
 */
export function formatRoomResponse(room, includeBookings = false) {
  const roomType = {
    id: room.id,
    name: room.type,
    description: room.description || "",
    pricePerNight: room.pricePerNight,
    availableRooms: room.availableRooms,
    amenities: room.amenities || [],
    images: room.images || {}
  };

  if (includeBookings && room.bookingRooms) {
    roomType.bookings = room.bookingRooms?.map(br => ({
      id: br.booking?.id,
      checkIn: br.booking?.checkIn,
      checkOut: br.booking?.checkOut,
      quantity: br.quantity
    })) || [];
  }

  return roomType;
}