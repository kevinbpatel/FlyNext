'use client';

import { Suspense, useState, useEffect } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Hotel } from "@/types/hotel";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HotelSearch } from "@/components/Search/HotelSearchBar";

// Import the extracted components
import HotelCard from "@/components/Hotel/Search/HotelCard";
import HotelFilters from "@/components/Hotel/Search/HotelFilters";

// Dynamically import the BasicHotelMap component to avoid SSR issues with Leaflet
const BasicHotelMap = dynamic(() => import("@/components/Maps/BasicHotelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
      Loading map...
    </div>
  ),
});

function HotelSearchResultsContent() {
  const { fetchWithAuth } = useUserContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for hotels and filtered hotels
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [priceRange, setPriceRange] = useState("any");
  const [starRating, setStarRating] = useState("any");

  // Fetch hotels from the API
  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      
      // Get city from URL params - use 'destination' parameter
      const city = searchParams.get('destination');
      
      if (!city) {
        setError("Please specify a city to search for hotels");
        setIsLoading(false);
        return;
      }
      
      try {
        // Build search URL with parameters
        const searchUrl = new URL('/api/hotels/search', window.location.origin);
        searchUrl.searchParams.append('city', city);
        
        // Add optional search parameters if they exist in URL
        const checkIn = searchParams.get('checkInDate');
        const checkOut = searchParams.get('checkOutDate');
        if (checkIn) searchUrl.searchParams.append('checkIn', checkIn);
        if (checkOut) searchUrl.searchParams.append('checkOut', checkOut);
        
        console.log('Fetching hotels with URL:', searchUrl.toString());
        
        // Fetch data from API
        const response = await fetch(searchUrl.toString());
        if (!response.ok) {
          throw new Error(`Error fetching hotels: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Hotel data received:', data);
        setHotels(data.hotels || []);
        setFilteredHotels(data.hotels || []);
      } catch (err) {
        console.error("Failed to fetch hotels:", err);
        setError("Failed to load hotels. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotels();
  }, [searchParams, fetchWithAuth]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let results = [...hotels];
    if (nameFilter) {
      results = results.filter(hotel =>
        hotel.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    if (starRating && starRating !== "any") {
      results = results.filter(hotel =>
        hotel.starRating === parseInt(starRating)
      );
    }
    if (priceRange && priceRange !== "any") {
      if (priceRange === "200+") {
        results = results.filter(hotel => (hotel.price ?? 0) >= 200);
      } else {
        const [min, max] = priceRange.split('-').map(p => parseInt(p));
        results = results.filter(hotel =>
          (hotel.price ?? 0) >= min && (hotel.price ?? 0) <= max
        );
      }
    }
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price-high':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'rating':
          return b.starRating - a.starRating;
        default:
          return 0;
      }
    });
    setFilteredHotels(results);
  }, [hotels, nameFilter, sortBy, priceRange, starRating]);

  // Handle hotel selection for the map
  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotel(prevSelected =>
      prevSelected === hotelId ? null : hotelId
    );
  };

  return (
    <>
      {/* Full-width search area - flush with navbar */}
      <div className="w-full border-b border-border">
        <div className="container mx-auto py-4">
          <HotelSearch />
        </div>
      </div>

      {/* Sticky filter section */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto py-4">
          <HotelFilters
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            starRating={starRating}
            setStarRating={setStarRating}
          />
        </div>
      </div>

      <div className="container mx-auto py-4">
        {/* Main content with hotel list and map */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Hotel list */}
          <div className="w-full md:w-3/5">
            <p className="text-sm mb-4">
              Hotel Results <strong>({filteredHotels.length})</strong>
            </p>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-48"></div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 rounded-lg text-destructive">
                <p>{error}</p>
              </div>
            ) : filteredHotels.length > 0 ? (
              <div className="space-y-4">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => handleHotelSelect(hotel.id)}
                    className="cursor-pointer hover:opacity-95"
                  >
                    <HotelCard
                      hotel={hotel}
                      selected={selectedHotel === hotel.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md text-center">
                No hotels match your current filters. Try adjusting your criteria.
              </div>
            )}
          </div>
          
          {/* Map container - using real coordinates now */}
          <div className="w-full md:w-2/5 h-[100vh] md:h-[calc(100vh-105px)] md:sticky md:top-[88px]">
            <div className="h-full">
              {isLoading ? (
                <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                  Loading map...
                </div>
              ) : (
                <BasicHotelMap
                  hotels={filteredHotels}
                  selectedHotel={selectedHotel}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HotelSearchResultsWrapper() {
  return (
    <Suspense fallback={<div>Loading hotel search results...</div>}>
      <HotelSearchResultsContent />
    </Suspense>
  );
}
