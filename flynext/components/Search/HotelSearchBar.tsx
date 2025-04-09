'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { LocationCombobox } from './LocationAutocomplete';
import { DateRangePicker } from './DateRangePicker';

import { Button } from '@/components/ui/button';

export const HotelSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [rooms, setRooms] = useState<number>(1);
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
    // First try to get from URL parameters
    const destinationParam = searchParams.get('destination');
    const destinationFullParam = searchParams.get('destinationFull');
    const checkInDateParam = searchParams.get('checkInDate');
    const checkOutDateParam = searchParams.get('checkOutDate');
    const roomsParam = searchParams.get('rooms');

    let shouldUpdate = false;

    // Use full parameters when available, fallback to short ones
    if (destinationFullParam) {
      setDestination(decodeURIComponent(destinationFullParam));
      shouldUpdate = true;
    } else if (destinationParam) {
      setDestination(destinationParam);
      shouldUpdate = true;
    }

    // Use timezone-safe date parsing
    if (checkInDateParam) {
      const date = createDateFromString(checkInDateParam);
      if (date) {
        setCheckInDate(date);
        shouldUpdate = true;
      }
    }

    if (checkOutDateParam) {
      const date = createDateFromString(checkOutDateParam);
      if (date) {
        setCheckOutDate(date);
        shouldUpdate = true;
      }
    }

    if (roomsParam) {
      const roomsCount = parseInt(roomsParam, 10);
      if (!isNaN(roomsCount) && roomsCount > 0 && roomsCount <= 9) {
        setRooms(roomsCount);
        shouldUpdate = true;
      }
    }

    // If no URL parameters, try to load from localStorage
    if (!shouldUpdate && typeof window !== 'undefined') {
      const savedSearch = localStorage.getItem('hotelSearch');
      if (savedSearch) {
        try {
          const saved = JSON.parse(savedSearch);
          if (saved.destination) setDestination(saved.destination);
          
          // Use timezone-safe date parsing for localStorage dates
          if (saved.checkInDate) {
            const date = new Date(saved.checkInDate);
            if (!isNaN(date.getTime())) setCheckInDate(date);
          }
          
          if (saved.checkOutDate) {
            const date = new Date(saved.checkOutDate);
            if (!isNaN(date.getTime())) setCheckOutDate(date);
          }
          
          if (saved.rooms && typeof saved.rooms === 'number' && saved.rooms > 0 && saved.rooms <= 9) {
            setRooms(saved.rooms);
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

    if (destination || checkInDate || checkOutDate) {
      localStorage.setItem('hotelSearch', JSON.stringify({
        destination,
        checkInDate: checkInDate?.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        rooms
      }));
    }
  }, [destination, checkInDate, checkOutDate, rooms]);

  // Format date for URL parameters in YYYY-MM-DD format
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Room count is directly available in state

  // Extract location code from full location string
  const extractLocationCode = (location: string) => {
    // If it's already just a city name, return as is
    if (/^[A-Za-z ]+$/.test(location)) {
      return location;
    }

    // Check if there's a location code in parentheses like "(NYC)"
    const codeMatch = location.match(/\(([A-Z]{3})\)/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1]; // Return the code found in parentheses
    }

    // Otherwise, fallback to extracting just the city part (before the comma)
    const cityPart = location.split(',')[0].trim();
    return cityPart;
  };

  const handleSearchClick = () => {
    if (!destination || !checkInDate || !checkOutDate) {
      alert('Please fill in all required fields: Destination, Check-in date, and Check-out date');
      return;
    }

    // Extract location code from the full location string
    const destinationCode = extractLocationCode(destination);

    // Build query parameters
    const searchParams = new URLSearchParams();
    searchParams.append('destination', destinationCode);
    searchParams.append('destinationFull', encodeURIComponent(destination));
    searchParams.append('checkInDate', formatDate(checkInDate));
    searchParams.append('checkOutDate', formatDate(checkOutDate));
    searchParams.append('rooms', rooms.toString());

    // Navigate to hotels page with search parameters
    router.push(`/hotels?${searchParams.toString()}`);
  };

  // Handle destination selection
  const handleDestinationSelect = (location: string) => {
    setDestination(location);

    // After selecting destination, focus on dates
    setTimeout(() => {
      setIsDatePickerOpen(true);
    }, 100);
  };

  // Prevent form submission on Enter
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} className="hotel-search-form w-full mx-auto">
      {/* Search fields with search button */}
      <div className="flex flex-col md:flex-row rounded-lg border border-border shadow-sm overflow-hidden bg-muted">
        {/* Destination field */}
        <div className="w-full md:w-1/3 h-16 bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col relative overflow-hidden rounded-t-lg md:rounded-none md:rounded-l-lg">
          <LocationCombobox
            id="destination"
            label="Destination"
            placeholder="City, hotel, place"
            value={destination}
            onChange={setDestination}
            onSelect={handleDestinationSelect}
            hideChevron={true}
          />
        </div>

        {/* Dates field */}
        <div className="w-full md:w-1/3 h-16 bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col mt-px md:mt-0 md:ml-0.5 relative overflow-visible">
          <DateRangePicker
            label="Check-in — Check-out"
            startDate={checkInDate}
            endDate={checkOutDate}
            onStartDateChange={setCheckInDate}
            onEndDateChange={setCheckOutDate}
            minDate={new Date()}
            initiallyOpen={isDatePickerOpen}
            onOpenChange={setIsDatePickerOpen}
            hideChevron={true}
            startSelectMode="checkin"
            endSelectMode="checkout"
            selectEndText="Select check-out"
            sameDayText="(1 night stay)"
          />
        </div>

        {/* Rooms counter */}
        <div className="w-full md:w-1/3 h-16 bg-card border-2 border-transparent hover:border-input focus-within:!border-primary active:!border-primary focus-within:z-10 transition-colors flex flex-col mt-px md:mt-0 md:ml-0.5 relative overflow-visible">
          <div className="px-4 py-2 flex flex-col h-full">
            <label className="text-xs text-muted-foreground">Rooms</label>
            <div className="flex items-center justify-between h-full">
              <div className="text-sm font-medium">{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  disabled={rooms <= 1}
                >
                  <span className="text-lg">-</span>
                </Button>
                <span className="w-6 text-center">{rooms}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setRooms(Math.min(9, rooms + 1))}
                  disabled={rooms >= 9}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="w-full md:w-16 mt-px md:mt-0 md:ml-0.5">
          <Button
            type="button"
            className="w-full h-16 rounded-b-lg md:rounded-none md:rounded-r-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSearchClick}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};