'use client';

import { useState } from 'react';
import {
  Clock,
  Plane,
  ChevronUp,
  ChevronDown,
  Circle,
  PlaneTakeoff,
  PlaneLanding,
  RefreshCcw,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlightTimeline } from './FlightTimeline';
import { FlightDetailTimeline } from './FlightDetailTimeline';

// Updated interfaces to match the simplified data structure
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Airline {
  code: string;
  name: string;
  logo?: string;
}

interface FlightSegment {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  originId: string;
  destinationId: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  airline: Airline;
  origin: Airport;
  destination: Airport;
}

interface FlightCardProps {
  id: string;
  flightNumber: string;
  airline: Airline;
  departureTime: string;
  arrivalTime: string;
  origin: Airport;
  destination: Airport;
  duration: string;
  price: number;
  currency: string;
  isNonstop: boolean;
  layoverInfo?: string | null;
  segments: FlightSegment[];
  isSelected?: boolean;  // New prop for selection state
  onSelect?: () => void; // New prop for selection handler
  onDeselect?: () => void; // New prop for deselection handler
  onBook: (id: string) => void;
}

export const FlightCard = ({
  id,
  flightNumber,
  airline,
  departureTime,
  arrivalTime,
  origin,
  destination,
  duration,
  price,
  currency,
  isNonstop,
  layoverInfo,
  segments,
  isSelected = false,
  onSelect,
  onDeselect,
  onBook,
}: FlightCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  // Calculate layover duration between flight segments
  const calculateLayoverDuration = (prevFlight: any, nextFlight: any) => {
    const prevArrival = new Date(prevFlight.arrivalTime);
    const nextDeparture = new Date(nextFlight.departureTime);

    const diffMs = nextDeparture.getTime() - prevArrival.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  // Format minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format the departure and arrival times
  const departureTimeFormatted = formatTime(departureTime);
  const arrivalTimeFormatted = formatTime(arrivalTime);

  // Format the dates
  const departureDateFormatted = formatDate(departureTime);
  const arrivalDateFormatted = formatDate(arrivalTime);

  // Format the price
  const formattedPrice = formatPrice(price, currency);

  // Check if we have multiple segments (layover flight)
  const hasLayover = segments.length > 1;

  // Extract number of stops from layover info
  const extractStops = (): number => {
    if (!layoverInfo) return 0;
    
    const match = layoverInfo.match(/(\d+)\s+stop/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return segments.length - 1; // Default to number of segments minus 1
  };

  // Calculate available seats (minimum across all segments)
  const calculateAvailableSeats = (): number => {
    if (!segments || segments.length === 0) return 0;
    return Math.min(...segments.map(segment => segment.availableSeats));
  };

  const availableSeats = calculateAvailableSeats();
  const stops = extractStops();

  // Handle selection toggle
  const handleSelectionToggle = () => {
    if (isSelected) {
      onDeselect && onDeselect();
    } else {
      onSelect && onSelect();
    }
  };

  return (
    <Card className={`w-full overflow-hidden border rounded-lg hover:shadow-md transition-shadow duration-200 ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : ''
    }`}>
      <CardContent className="p-0">
        {/* Selected indicator */}
        {isSelected && (
          <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-4">
            Selected
          </div>
        )}
        
        {/* Main flight info section */}
        <div className="grid grid-cols-1 md:grid-cols-12 px-4 py-3 gap-2 items-center">
          {/* Airline and flight details - using grid cols for better control */}
          <div className="md:col-span-3 mb-2 md:mb-0">
            <div className="font-medium truncate text-foreground">{airline.name}</div>
            <div className="text-sm text-muted-foreground">{flightNumber}</div>
          </div>

          {/* Flight timing and route - centered in the middle 6 columns */}
          <div className="md:col-span-6 flex justify-center items-center space-x-2 md:space-x-4 mb-2 md:mb-0">
            {/* Departure */}
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{departureTimeFormatted}</div>
              <div className="text-sm text-muted-foreground">{origin.code}</div>
            </div>

            {/* Flight path timeline */}
            <FlightTimeline 
              duration={duration} 
              isReversed={false} 
              isNonstop={isNonstop}
              stops={stops}
            />

            {/* Arrival */}
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{arrivalTimeFormatted}</div>
              <div className="text-sm text-muted-foreground">{destination.code}</div>
            </div>
          </div>

          {/* Price and availability - now using last 3 columns */}
          <div className="md:col-span-3 flex flex-col items-end">
            <div className="text-xl font-bold text-primary">{formattedPrice}</div>
            <div className="text-sm text-muted-foreground">
              {availableSeats > 0 
                ? `${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left` 
                : "Sold out"}
            </div>
          </div>
        </div>

        {/* Extra info - only shown when expanded */}
        {expanded && (
          <FlightDetailTimeline
            departureDateFormatted={departureDateFormatted}
            departureTimeFormatted={departureTimeFormatted}
            arrivalDateFormatted={arrivalDateFormatted}
            arrivalTimeFormatted={arrivalTimeFormatted}
            duration={duration}
            airline={airline}
            flightNumber={flightNumber}
            origin={origin}
            destination={destination}
            hasLayover={hasLayover}
            segments={segments}
            formatDate={formatDate}
            formatTime={formatTime}
            formatDuration={formatDuration}
            calculateLayoverDuration={(prev, next) => calculateLayoverDuration(prev, next)}
          />
        )}
      </CardContent>

      <CardFooter className="px-4 py-2 border-t flex justify-between items-center bg-muted/50">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground text-sm pl-0"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                View details
              </>
            )}
          </Button>
        </div>

        <div className="flex space-x-2">
          {isSelected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSelectionToggle}
            >
              <X className="w-3 h-3 mr-1" />
              Deselect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectionToggle}
              className="border-primary/50 hover:bg-primary/10"
            >
              <Check className="w-3 h-3 mr-1" />
              Select
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};