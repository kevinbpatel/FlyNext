import { BookingRoom as ParentBookingRoom } from "../types";

export interface RoomCardProps {
  bookingRoom: {
    id?: string;
    quantity: number;
    room: {
      id: string;
      type: string;
      pricePerNight: string;
      amenities: string[];
    };
    status?: string;
  };
  formatCurrency: (value: string | number | undefined | null) => string;
  bookingStatus?: string;
  removingRoomId: string | null;
  handleRemoveRoom: (roomId: string) => Promise<void>;
  cancelingRoomId: string | null;
  onCancelRoom?: (roomId: string) => Promise<void>;
  nights: number;
}
