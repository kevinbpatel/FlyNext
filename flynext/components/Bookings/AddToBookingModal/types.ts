export interface SelectedFlight {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  isReturn: boolean;
}

export interface RoomType {
  id: string;
  type: string;
  pricePerNight: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  images: string[];
}

export interface Booking {
  id: string;
  name: string;
  status: string;
  paymentStatus: string;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  hotel: {
    id: string;
    name: string;
    starRating: number;
    address: string;
  } | null;
  rooms: Array<{
    id: string;
    type: string;
    quantity: number;
    pricePerNight: string;
    amenities: string[];
    totalPrice: number;
  }>;
  flights: Array<{
    id: string;
    flightId: string;
    bookingReference: string;
  }>;
  hotelCost: number;
  flightCost: number;
}

export interface AddToBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOutboundFlight?: SelectedFlight | null;
  selectedReturnFlight?: SelectedFlight | null;
  travelers?: number;
  selectedRoom?: RoomType | null;
  roomQuantity?: number;
  checkIn?: Date | null;
  checkOut?: Date | null;
  modalType: 'flight' | 'room';
}

export interface BookingsListProps {
  bookings: Booking[];
  selectedBookingId: string | null;
  onSelectBooking: (bookingId: string) => void;
  isLoading: boolean;
}

export interface CreateNewBookingButtonProps {
  onClick: () => void;
}

export interface ModalFooterProps {
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isConfirmDisabled: boolean;
}