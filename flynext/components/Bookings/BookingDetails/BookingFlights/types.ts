import { FlightVerification } from '@/components/Bookings/BookingDetails/BookingFlights/useFlightVerification';
import { Flight as ParentFlight } from '../types';

export type Flight = ParentFlight;

export interface FlightCardProps {
  flight: Flight;
  formatCurrency: (amount: number) => string;
  bookingStatus?: string;
  removingFlightId: string | null;
  handleRemoveFlight: (flightId: string) => Promise<void>;
  flightVerifications: Record<string, FlightVerification>;
  isVerifying: boolean;
}

export interface FlightBookingHeaderProps {
  allFlightsCanceled: boolean;
  bookingReference?: string;
  bookingStatus: string;
}

export interface FlightBookingFooterProps {
  allFlightsCanceled: boolean;
  bookingStatus: string;
  flights: Flight[];
  cancelingFlightId: string | null;
  onCancelFlight: (flightId: string) => Promise<void>;
}

export interface FlightStatusDisplayProps {
  flight: Flight;
  flightVerifications: Record<string, FlightVerification>;
  isVerifying: boolean;
}