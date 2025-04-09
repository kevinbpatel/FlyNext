// Location details interface (airport/city)
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
  // Nested objects for detailed information
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

export interface FlightConfirmation {
  bookingReference: string;
  ticketNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  status: string;
  agencyId: string;
  createdAt: string;
  flights: FlightDetails[];
}

// Room interface
export interface Room {
  id: string;
  type: string;
  quantity: number;
  pricePerNight: string;
  amenities: string[];
  totalPrice: number;
}

// Hotel interface
export interface Hotel {
  id: string;
  name: string;
  starRating: number;
  address: string;
  logo?: string;
}

// Booking Room entry (different from Room as it's part of a booking)
export interface BookingRoom {
  quantity: number;
  room: {
    id: string;
    type: string;
    pricePerNight: string;
    amenities: string[];
  }
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

export interface BookingResponse {
  message: string;
  booking: BookingDetails;
  flightConfirmation?: FlightConfirmation;
  totalPrice: number;
}

// Flight verification interfaces (new)
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

// Component props interfaces
export interface BookingRoomsProps {
  booking: BookingDetails;
  formatCurrency: (value: string | number | undefined | null) => string;
  formatDate: (dateString: string) => string;
}

export interface BookingFlightsProps {
  flights: Flight[];
  formatCurrency: (value: string | number | null | undefined) => string;
  bookingId: string;
  onRemoveFlight: (flightId: string) => Promise<void>;
  onCancelFlight: (flightIdOrReference: string) => Promise<void>;
  cancelingFlightId: string | null;
  bookingStatus?: string;
  flightVerifications?: Record<string, FlightVerification>; // Changed from flightStatuses
  isVerifying?: boolean; // Changed from isLoadingStatuses
  verificationTimestamp?: string | null; // New property
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
  params: PageParams | Promise<PageParams>;
}