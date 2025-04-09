// components/Bookings/BookingDetails/utils.ts
import { BookingDetails, Address } from './types';

/**
 * Format a currency value
 */
export const formatCurrency = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '$0.00';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numericValue);
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format address from an Address object or string
 */
export const formatAddress = (address: Address | string | unknown): string => {
  if (typeof address === 'string') return address;
  
  if (address && typeof address === 'object') {
    const addr = address as Address;
    const parts = [];
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);
    if (addr.country) parts.push(addr.country);
    if (addr.postalCode) parts.push(addr.postalCode);
    
    return parts.join(', ');
  }
  
  return 'No address available';
};

/**
 * Calculate the total hotel cost for a booking
 */
export const calculateHotelCost = (booking: BookingDetails): number => {
  if (!booking.bookingRooms || booking.bookingRooms.length === 0) return 0;
  
  return booking.bookingRooms.reduce((total, bookingRoom) => {
    return total + (parseFloat(bookingRoom.room.pricePerNight) * bookingRoom.quantity * (booking.nights || 1));
  }, 0);
};

/**
 * Calculate the total flight cost for a booking
 */
export const calculateFlightCost = (booking: BookingDetails): number => {
  if (!booking.bookingFlights || booking.bookingFlights.length === 0) return 0;
  
  return booking.bookingFlights.reduce((total, flight) => {
    return total + (flight.flightDetails?.price || 0);
  }, 0);
};

/**
 * Calculate the total cost including taxes and fees
 */
export const calculateTotal = (booking: BookingDetails): number => {
  const hotelCost = calculateHotelCost(booking);
  const flightCost = calculateFlightCost(booking);
  const subtotal = hotelCost + flightCost;
  const taxesAndFees = subtotal * 0.15; // 15% for taxes and fees
  
  return subtotal + taxesAndFees;
};