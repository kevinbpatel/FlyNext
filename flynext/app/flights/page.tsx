'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlightSearch } from '@/components/Search/FlightSearchBar';
import { FlightCard } from '@/components/Flight/FlightCard';
import { FlightSelectionSummary } from '@/components/Flight/FlightSelectionSummary';
import { TripTypeSelector } from '@/components/Search/TripTypeSelector';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Flight data interfaces
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
  status: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
}

interface Result {
  legs: number;
  flights: FlightSegment[];
  seatsLeft?: number;
}

interface ApiResponse {
  results: Result[];
  error?: string;
}

// New interface for selected flights
interface SelectedFlight {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  isReturn: boolean;
}

// The inner component containing your page logic
function FlightsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [outboundResults, setOutboundResults] = useState<Result[]>([]);
  const [returnResults, setReturnResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New state for tracking selected flights
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<SelectedFlight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<SelectedFlight | null>(null);
  const [travelers, setTravelers] = useState(1);

  // Get search parameters
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const tripType = searchParams.get('tripType') || 'one-way';
  const travelersParam = Number(searchParams.get('travelers') || '1');

  // Handler for trip type changes
  const handleTripTypeChange = (newTripType: 'round-trip' | 'one-way') => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tripType', newTripType);
    if (newTripType === 'one-way') {
      newParams.delete('returnDate');
    }
    router.push(`/flights?${newParams.toString()}`);
  };

  useEffect(() => {
    setTravelers(travelersParam);
  }, [travelersParam]);

  // Filter results based on available seats
  const filterByAvailableSeats = (results: Result[]) => {
    return results.filter(result => {
      const minAvailableSeats = Math.min(...result.flights.map(flight => flight.availableSeats));
      return minAvailableSeats >= travelers;
    });
  };

  // Fetch flights from API
  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
    setReturnResults([]);

    try {
      console.log('Search parameters:', { from, to, departureDate, returnDate, tripType, travelers: travelersParam });
      const outboundUrl = `/api/flights/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${departureDate}`;
      console.log('Outbound API request URL:', outboundUrl);

      const outboundResponse = await fetch(outboundUrl);
      const outboundData: ApiResponse = await outboundResponse.json();
      if (outboundData.error) {
        throw new Error(outboundData.error);
      }
      const filteredOutboundResults = filterByAvailableSeats(outboundData.results || []);
      setOutboundResults(filteredOutboundResults);

      if (tripType === 'round-trip' && returnDate) {
        const returnUrl = `/api/flights/search?origin=${encodeURIComponent(to)}&destination=${encodeURIComponent(from)}&date=${returnDate}`;
        console.log('Return API request URL:', returnUrl);

        const returnResponse = await fetch(returnUrl);
        const returnData: ApiResponse = await returnResponse.json();
        if (returnData.error) {
          throw new Error(returnData.error);
        }
        const filteredReturnResults = filterByAvailableSeats(returnData.results || []);
        setReturnResults(filteredReturnResults);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flights';
      setError(errorMessage);
      console.error('Error fetching flights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // New functions to handle flight selection
  const handleSelectFlight = (flightData: any, isReturn: boolean) => {
    const selectedFlight: SelectedFlight = {
      id: flightData.id,
      origin: flightData.origin.code,
      destination: flightData.destination.code,
      departureTime: flightData.departureTime,
      arrivalTime: flightData.arrivalTime,
      price: flightData.price,
      currency: flightData.currency,
      isReturn: isReturn
    };

    if (isReturn) {
      setSelectedReturnFlight(selectedFlight);
    } else {
      setSelectedOutboundFlight(selectedFlight);
    }
  };

  const handleDeselectFlight = (isReturn: boolean) => {
    if (isReturn) {
      setSelectedReturnFlight(null);
    } else {
      setSelectedOutboundFlight(null);
    }
  };

  const handleBookFlight = (id: string) => {
    console.log(`Booking flight ${id} for ${travelers} travelers`);
    alert(`You are booking flight ${id} for ${travelers} travelers`);
  };

  useEffect(() => {
    if (from && to && departureDate) {
      fetchFlights();
    } else if (searchParams.toString()) {
      setError('Please provide origin, destination, and departure date');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const processFlightResult = (result: Result, isReturn: boolean) => {
    const firstFlight = result.flights[0];
    const lastFlight = result.flights[result.flights.length - 1];
    const compositeId = result.flights.map(flight => flight.id).join('-');
    const hasLayover = result.legs > 1;
    let layoverInfo = null;

    if (hasLayover && result.flights.length > 1) {
      const layoverCities = result.flights.slice(0, -1).map(flight => flight.destination.code);
      layoverInfo = `${result.flights.length - 1} stop${result.flights.length > 2 ? 's' : ''} ${layoverCities.join(', ')}`;
    }

    const totalDuration = result.flights.reduce((acc, flight) => acc + flight.duration, 0);
    let totalJourneyDuration = totalDuration;
    if (hasLayover) {
      for (let i = 0; i < result.flights.length - 1; i++) {
        const currFlight = result.flights[i];
        const nextFlight = result.flights[i + 1];
        const currArrival = new Date(currFlight.arrivalTime);
        const nextDeparture = new Date(nextFlight.departureTime);
        totalJourneyDuration += Math.floor((nextDeparture.getTime() - currArrival.getTime()) / (1000 * 60));
      }
    }

    return {
      id: compositeId,
      flightNumber: firstFlight.flightNumber,
      airline: firstFlight.airline,
      departureTime: firstFlight.departureTime,
      arrivalTime: lastFlight.arrivalTime,
      origin: firstFlight.origin,
      destination: lastFlight.destination,
      duration: formatDuration(totalJourneyDuration),
      price: result.flights.reduce((sum, flight) => sum + flight.price, 0),
      currency: firstFlight.currency,
      isNonstop: !hasLayover,
      layoverInfo: layoverInfo,
      segments: result.flights,
      isReturn: isReturn
    };
  };

  const getAllResults = () => {
    const processedOutbound = outboundResults.map(result => processFlightResult(result, false));
    const processedReturn = returnResults.map(result => processFlightResult(result, true));
    return tripType === 'round-trip' && returnDate ? [...processedOutbound, ...processedReturn] : processedOutbound;
  };

  const totalFlightsCount = outboundResults.length + returnResults.length;
  const shouldShowSummary = !isLoading && !error && searchParams.toString();

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="w-full border-b border-border">
        <div className="container mx-auto py-4">
          <div className="flex items-center mb-4">
            <TripTypeSelector tripType={tripType as 'round-trip' | 'one-way'} onTripTypeChange={handleTripTypeChange} />
            <div className="flex-grow"></div>
          </div>
          <FlightSearch tripType={tripType as 'round-trip' | 'one-way'} />
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <div className="container mx-auto py-4 flex-grow">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium text-foreground">Searching for flights</h3>
              <p className="text-muted-foreground mt-1">Finding the best options for you...</p>
            </div>
          )}

          {!isLoading && totalFlightsCount === 0 && !error && searchParams.toString() && (
            <div className="bg-muted rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">No flights found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                We couldn't find any flights matching your search criteria.
                Try adjusting your dates or airports and search again.
              </p>
            </div>
          )}

          {!isLoading && !error && searchParams.toString() && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {tripType === 'round-trip'
                    ? `Outbound Flights (${outboundResults.length})`
                    : `Available Flights (${outboundResults.length})`}
                </h3>
                {outboundResults.length > 0 ? (
                  <div className="space-y-4">
                    {outboundResults.map((result, index) => {
                      const flightData = processFlightResult(result, false);
                      const isSelected = selectedOutboundFlight?.id === flightData.id;
                      return (
                        <FlightCard
                          key={`outbound-${index}`}
                          {...flightData}
                          isSelected={isSelected}
                          onSelect={() => handleSelectFlight(flightData, false)}
                          onDeselect={() => handleDeselectFlight(false)}
                          onBook={handleBookFlight}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-muted rounded-xl p-6 text-center">
                    <p className="text-muted-foreground">
                      No outbound flights available for the selected route and date.
                      Please try a different date or route.
                    </p>
                  </div>
                )}
              </div>

              {tripType === 'round-trip' && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Return Flights ({returnResults.length})
                  </h3>
                  {returnResults.length > 0 ? (
                    <div className="space-y-4">
                      {returnResults.map((result, index) => {
                        const flightData = processFlightResult(result, true);
                        const isSelected = selectedReturnFlight?.id === flightData.id;
                        return (
                          <FlightCard
                            key={`return-${index}`}
                            {...flightData}
                            isSelected={isSelected}
                            onSelect={() => handleSelectFlight(flightData, true)}
                            onDeselect={() => handleDeselectFlight(true)}
                            onBook={handleBookFlight}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted rounded-xl p-6 text-center">
                      <p className="text-muted-foreground">
                        No return flights available for the selected route and date.
                        Please try a different date or route.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {totalFlightsCount < 4 && <div className="min-h-[400px]"></div>}
        </div>
      </div>

      {shouldShowSummary && (
        <FlightSelectionSummary
          selectedOutboundFlight={selectedOutboundFlight}
          selectedReturnFlight={selectedReturnFlight}
          travelers={travelers}
          onTravelersChange={setTravelers}
          tripType={tripType}
          currency={selectedOutboundFlight?.currency || 'USD'}
        />
      )}
    </div>
  );
}

// Export the component wrapped in a Suspense boundary
export default function FlightsPage() {
  return (
    <Suspense fallback={<div>Loading flights...</div>}>
      <FlightsPageContent />
    </Suspense>
  );
}
