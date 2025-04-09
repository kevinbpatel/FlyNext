// @/types/hotel.ts

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Hotel {
  id: string;
  name: string;
  logo?: string;
  address: Address;
  starRating: number;
  cityId: string;
  ownerId: string;
  images?: Record<string, string>;
  price?: number; // Starting price derived from rooms
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  type: string;
  pricePerNight: number;
  availableRooms: number;
  hotelId: string;
}

export interface HotelSearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minStarRating?: number;
  maxStarRating?: number;
}

export interface RoomAvailability {
  roomTypeId: string;
  availableDates: {
    date: string;
    availableRooms: number;
    priceAdjustment?: number;
  }[];
}
export interface HotelReservation {
  id: string;
  hotelId: string;
  roomTypeId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}