'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { LocationCombobox } from './LocationAutocomplete';
import { DateRangePicker } from './DateRangePicker';
import { DatePicker } from './DatePicker';
import { GuestCounter } from './GuestCounter';
import { Button } from '@/components/ui/button';

// Modified to accept tripType as a prop
interface FlightSearchProps {
  tripType: 'one-way' | 'round-trip';
}

export const FlightSearch = ({ tripType }: FlightSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [travelers, setTravelers] = useState<string>('1 Traveler');
  const [travelerCounts, setTravelerCounts] = useState<Record<string, number>>({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // Helper function to create a Date from YYYY-MM-DD string (timezone-safe)
  const createDateFromString = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    
    // Parse the date parts from YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
    
    // Create date using local timezone (month is 0-indexed in JS)
    return new Date(year, month - 1, day);
  };

  // Load search parameters from URL or localStorage on component mount
  useEffect(() => {
    // First try to get from URL parameters (for search page)
    const fromParam = searchParams.get('from');
    const fromFullParam = searchParams.get('fromFull');
    const toParam = searchParams.get('to');
    const toFullParam = searchParams.get('toFull');
    const departureDateParam = searchParams.get('departureDate');
    const returnDateParam = searchParams.get('returnDate');
    const travelersParam = searchParams.get('travelers');

    let shouldUpdate = false;

    // Use full parameters when available, fallback to short ones
    if (fromFullParam) {
      setFromLocation(decodeURIComponent(fromFullParam));
      shouldUpdate = true;
    } else if (fromParam) {
      setFromLocation(fromParam);
      shouldUpdate = true;
    }

    if (toFullParam) {
      setToLocation(decodeURIComponent(toFullParam));
      shouldUpdate = true;
    } else if (toParam) {
      setToLocation(toParam);
      shouldUpdate = true;
    }

    // Use timezone-safe date parsing
    if (departureDateParam) {
      const date = createDateFromString(departureDateParam);
      if (date) {
        setDepartureDate(date);
        shouldUpdate = true;
      }
    }

    if (returnDateParam) {
      const date = createDateFromString(returnDateParam);
      if (date) {
        setReturnDate(date);
        shouldUpdate = true;
      }
    }

    if (travelersParam) {
      const travelersCount = parseInt(travelersParam, 10);
      if (!isNaN(travelersCount)) {
        setTravelerCounts({
          adults: Math.min(travelersCount, 9),
          children: 0,
          infants: 0
        });
        setTravelers(`${travelersCount} Traveler${travelersCount !== 1 ? 's' : ''}`);
        shouldUpdate = true;
      }
    }

    // If no URL parameters, try to load from localStorage
    if (!shouldUpdate && typeof window !== 'undefined') {
      const savedSearch = localStorage.getItem('flightSearch');
      if (savedSearch) {
        try {
          const saved = JSON.parse(savedSearch);
          if (saved.fromLocation) setFromLocation(saved.fromLocation);
          if (saved.toLocation) setToLocation(saved.toLocation);
          
          // Use timezone-safe date parsing for localStorage dates
          if (saved.departureDate) {
            const date = new Date(saved.departureDate);
            if (!isNaN(date.getTime())) setDepartureDate(date);
          }
          
          if (saved.returnDate) {
            const date = new Date(saved.returnDate);
            if (!isNaN(date.getTime())) setReturnDate(date);
          }
          
          if (saved.travelerCounts) {
            setTravelerCounts(saved.travelerCounts);
            const totalTravelers = Object.values(saved.travelerCounts as Record<string, number>)
              .reduce((sum, count) => sum + count, 0);
            setTravelers(`${totalTravelers} Traveler${totalTravelers !== 1 ? 's' : ''}`);
          }
        } catch (error) {
          console.error('Error parsing saved search', error);
        }
      }
    }
  }, [searchParams]);

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (fromLocation || toLocation || departureDate || returnDate) {
      localStorage.setItem('flightSearch', JSON.stringify({
        fromLocation,
        toLocation,
        departureDate: departureDate?.toISOString(),
        returnDate: returnDate?.toISOString(),
        tripType,
        travelerCounts
      }));
    }
  }, [fromLocation, toLocation, departureDate, returnDate, tripType, travelerCounts]);

  // Format date for URL parameters in YYYY-MM-DD format
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getTotalTravelers = () => {
    return Object.values(travelerCounts).reduce((sum, count) => sum + count, 0);
  };

  // Extract airport code from full location string
  const extractLocationCode = (location: string) => {
    // If it's already just a 3-letter airport code, return as is
    if (/^[A-Z]{3}$/.test(location)) {
      return location;
    }

    // Check if there's an airport code in parentheses like "(YYZ)"
    const codeMatch = location.match(/\(([A-Z]{3})\)/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1]; // Return the code found in parentheses
    }

    // Otherwise, fallback to extracting just the city part (before the comma)
    const cityPart = location.split(',')[0].trim();
    return cityPart;
  };

  const handleSearchClick = () => {
    if (!fromLocation || !toLocation || !departureDate) {
      alert('Please fill in all required fields: From, To, and Departure date');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      alert('Please select a return date for round-trip');
      return;
    }

    // Extract location codes from the full location strings
    const fromLocationCode = extractLocationCode(fromLocation);
    const toLocationCode = extractLocationCode(toLocation);

    // Build query parameters
    const searchParams = new URLSearchParams();
    searchParams.append('from', fromLocationCode);
    searchParams.append('fromFull', encodeURIComponent(fromLocation));

    searchParams.append('to', toLocationCode);
    searchParams.append('toFull', encodeURIComponent(toLocation));

    searchParams.append('departureDate', formatDate(departureDate));

    if (tripType === 'round-trip' && returnDate) {
      searchParams.append('returnDate', formatDate(returnDate));
    }

    searchParams.append('tripType', tripType);
    searchParams.append('travelers', getTotalTravelers().toString());

    // Navigate to flights page with search parameters
    router.push(`/flights?${searchParams.toString()}`);
  };

  // Handle from location selection
  const handleFromLocationSelect = (location: string) => {
    setFromLocation(location);

    // If both locations are filled, focus on dates
    if (toLocation) {
      setTimeout(() => {
        setIsDatePickerOpen(true);
      }, 100);
    }
  };

  // Handle to location selection
  const handleToLocationSelect = (location: string) => {
    setToLocation(location);

    // If both locations are filled, focus on dates
    if (fromLocation) {
      setTimeout(() => {
        setIsDatePickerOpen(true);
      }, 100);
    }
  };

  // Prevent form submission on Enter
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} className="flight-search-form w-full mx-auto">
      {/* Search fields with search button - updated colors for dark mode compatibility */}
      <div className="flex flex-col md:flex-row rounded-lg border border-border shadow-sm overflow-hidden bg-muted">
        {/* From field */}
        <div className="w-full md:w-1/4 min-h-[64px] bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col relative overflow-hidden rounded-t-lg md:rounded-none md:rounded-l-lg">
          <LocationCombobox
            id="from"
            label="From"
            placeholder="City or Airport"
            value={fromLocation}
            onChange={setFromLocation}
            onSelect={handleFromLocationSelect}
            hideChevron={true}
          />
        </div>

        {/* To field */}
        <div className="w-full md:w-1/4 min-h-[64px] bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col mt-px md:mt-0 md:ml-0.5 relative overflow-hidden">
          <LocationCombobox
            id="to"
            label="To"
            placeholder="City or Airport"
            value={toLocation}
            onChange={setToLocation}
            onSelect={handleToLocationSelect}
            hideChevron={true}
          />
        </div>

        {/* Dates field - Using DateRangePicker for round-trip and regular DatePicker for one-way */}
        <div className="w-full md:w-1/4 min-h-[64px] bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col mt-px md:mt-0 md:ml-0.5 relative overflow-visible">
          {tripType === 'round-trip' ? (
            <DateRangePicker
              label="Departure — Return"
              startDate={departureDate}
              endDate={returnDate}
              onStartDateChange={setDepartureDate}
              onEndDateChange={setReturnDate}
              minDate={new Date()}
              initiallyOpen={isDatePickerOpen}
              onOpenChange={setIsDatePickerOpen}
              hideChevron={true}
              startSelectMode="departure"
              endSelectMode="return"
              selectEndText="Select return"
              sameDayText="(Same day round trip)"
            />
          ) : (
            <DatePicker
              label="Departure"
              placeholder="Select date"
              singleDate={true}
              startDate={departureDate}
              endDate={returnDate}
              onStartDateChange={setDepartureDate}
              onEndDateChange={setReturnDate}
              minDate={new Date()}
              initiallyOpen={isDatePickerOpen}
              onOpenChange={setIsDatePickerOpen}
              hideChevron={true}
            />
          )}
        </div>

        {/* Traveler info */}
        <div className="w-full md:w-1/4 min-h-[64px] bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col mt-px md:mt-0 md:ml-0.5 relative overflow-visible">
          <GuestCounter
            label="Travelers"
            summaryFormat="traveler"
            guestTypes={[
              {
                id: 'adults',
                label: 'Adults',
                description: 'Ages 13+',
                minValue: 1,
                defaultValue: 1,
                maxValue: 9
              },
              {
                id: 'children',
                label: 'Children',
                description: 'Ages 2-12',
                maxValue: 8
              },
              {
                id: 'infants',
                label: 'Infants',
                description: 'Under 2',
                maxValue: 5
              }
            ]}
            onChange={(counts) => {
              setTravelerCounts(counts);
            }}
            onSummaryChange={(summary) => {
              setTravelers(summary);
            }}
          />
        </div>

        {/* Search button - updated to use primary colors */}
        <div className="w-full md:w-16 mt-px md:mt-0 md:ml-0.5">
          <Button
            type="button"
            className="w-full min-h-[64px] rounded-b-lg md:rounded-none md:rounded-r-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSearchClick}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};