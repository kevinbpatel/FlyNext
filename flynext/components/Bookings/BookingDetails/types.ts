// components/Bookings/BookingDetails/types.ts

// Address interface for hotel location
export interface Address {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

// Hotel information
export interface Hotel {
  id: string;
  name: string;
  starRating: number;
  address: Address | string;
  logo?: string;
}

// Room details
export interface Room {
  id: string;
  type: string;
  pricePerNight: string;
  amenities: string[];
}

// Booking room entry
export interface BookingRoom {
  id?: string;
  quantity: number;
  room: Room;
  status?: string;
}

// Location details for airports/cities
export interface LocationDetails {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Airline details
export interface AirlineDetails {
  code: string;
  name: string;
  logo?: string;
}

// Flight details
export interface FlightDetails {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: string;
  duration: number;
  currency: string;
  originId?: string;
  destinationId?: string;
  originDetails: LocationDetails;
  destinationDetails: LocationDetails;
  airlineDetails: AirlineDetails;
}

// Flight booking
export interface Flight {
  id: string;
  bookingId?: string;
  flightId: string;
  bookingReference: string;
  status?: string;
  flightDetails?: FlightDetails;
}

// Flight verification
export interface FlightVerification {
  flightId: string;
  verified: boolean;
  bookingReference: string;
  status?: string;
  message?: string;
  hasChanges?: boolean;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  origin?: string;
  destination?: string;
}

// Complete booking details
export interface BookingDetails {
  id: string;
  name: string;
  userId?: string;
  hotelId?: string | null;
  status: string;
  paymentStatus: string;
  checkIn: string | null;
  checkOut: string | null;
  nights?: number;
  totalPrice: string | number;
  createdAt: string;
  updatedAt: string;
  hotel: Hotel | null;
  bookingRooms: BookingRoom[];
  bookingFlights: Flight[];
  hotelCost?: number;
  flightCost?: number;
}

// Verification response
export interface VerificationResponse {
  message: string;
  booking: {
    id: string;
    status: string;
    passengerName: string;
  };
  flightVerifications: FlightVerification[];
  bookingReferences: string[];
  verificationTimestamp: string;
}

// Component Props
export interface BookingHeaderProps {
  booking: BookingDetails;
  formatDate: (dateString: string) => string;
  hasVerifiableFlights: boolean;
  verifyFlights: () => void;
  isVerifying: boolean;
  verificationData?: VerificationResponse | null;
}

export interface BookingRoomsProps {
  booking: BookingDetails;
  formatCurrency: (value: string | number | undefined | null) => string;
  formatDate: (dateString: string) => string;
  setBooking: any;
}

export interface BookingFlightsProps {
  flights: Flight[];
  formatCurrency: (value: string | number | null | undefined) => string;
  bookingId: string;
  onRemoveFlight: (flightId: string) => Promise<void>;
  onCancelFlight: (flightIdOrReference: string) => Promise<void>;
  cancelingFlightId: string | null;
  bookingStatus?: string;
  flightVerifications?: Record<string, FlightVerification>;
  isVerifying?: boolean;
  verificationTimestamp?: string | null;
}

export interface BookingSummaryProps {
  bookingId: string;
  bookingFlightsLength: number;
  bookingRoomsLength: number;
  paymentStatus: string;
  calculateHotelCost: () => number;
  calculateFlightCost: () => number;
  calculateTotal: () => number;
  formatCurrency: (value: string | number | undefined | null) => string;
}

// Page params
export interface PageParams {
  id: string;
}

export interface BookingDetailsPageProps {
  params: PageParams;
}
