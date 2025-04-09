export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  roomsBooked: number;
}

export interface BookingsProps {
  hotelId: string;
  fetchWithAuth: any;
}

export interface BookingsFiltersProps {
  roomTypes: RoomType[];
  roomTypeFilter: string;
  selectedDate: Date | undefined;
  setRoomTypeFilter: (value: string) => void;
  setSelectedDate: (value: Date | undefined) => void;
  clearFilters: () => void;
}

// Import RoomType for BookingsFiltersProps
import { RoomType } from "../RoomsTypes/types";

export type { RoomType };