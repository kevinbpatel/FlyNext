import { BookingDetails, BookingRoom, Flight } from '@/types/booking';

/**
 * Formats a currency value as a string with $ symbol and two decimal places
 */
export const formatCurrency = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '$0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0.00';
  return `$${numValue.toFixed(2)}`;
};

/**
 * Calculates the total cost of hotel bookings
 */
export const calculateHotelCost = (booking: BookingDetails | null): number => {
  if (!booking || !booking.bookingRooms || booking.bookingRooms.length === 0) return 0;

  return booking.bookingRooms.reduce((total: number, bookingRoom: BookingRoom) => {
    const pricePerNight = parseFloat(bookingRoom.room.pricePerNight) || 0;
    const quantity = bookingRoom.quantity || 0;
    const nights = booking.nights || 1;
    return total + (pricePerNight * quantity * nights);
  }, 0);
};

/**
 * Calculates the total cost of flight bookings
 */
export const calculateFlightCost = (booking: BookingDetails | null): number => {
  if (!booking || !booking.bookingFlights || booking.bookingFlights.length === 0) return 0;

  return booking.bookingFlights.reduce((total: number, flight: Flight) => {
    if (flight.flightDetails && flight.flightDetails.price) {
      return total + flight.flightDetails.price;
    }
    return total;
  }, 0);
};

/**
 * Calculates the total cost including taxes and fees
 */
export const calculateTotal = (booking: BookingDetails | null): number => {
  if (!booking) return 0;

  const hotelCost = calculateHotelCost(booking);
  const flightCost = calculateFlightCost(booking);
  const taxesAndFees = (hotelCost + flightCost) * 0.13;

  return hotelCost + flightCost + taxesAndFees;
};