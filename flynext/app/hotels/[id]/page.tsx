"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { 
  Star, 
  ArrowLeft,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";
import { Hotel } from "@/types/hotel";
import ImageCarousel from "@/components/Images/ImageCarousel";
import RoomSelection from "@/components/Bookings/RoomSelection/RoomSelection";

// Types based on the backend response
interface RoomType {
  id: string;
  type: string;
  pricePerNight: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  images: string[];
}

interface HotelResponse {
  hotel: Hotel & {
    rooms: RoomType[];
  };
}

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchWithAuth } = useUserContext();
  const [hotel, setHotel] = useState<Hotel & { rooms: RoomType[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get check-in and check-out dates from URL params
  const checkInStr = searchParams.get('checkIn') || new Date().toISOString().split('T')[0];
  const checkOutStr = searchParams.get('checkOut') || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Convert string dates to Date objects for the RoomSelection component
  const initialCheckIn = new Date(checkInStr);
  const initialCheckOut = new Date(checkOutStr);


  const destination = searchParams.get('destination');
  const destinationFull = searchParams.get('destinationFull');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  
  const query = new URLSearchParams();

  if (destination) query.set('destination', destination);
  if (destinationFull) query.set('destinationFull', destinationFull);
  if (checkInDate) query.set('checkInDate', checkInDate);
  if (checkOutDate) query.set('checkOutDate', checkOutDate);

  
  // Get travelers from URL params or default to 2
  const travelers = parseInt(searchParams.get('travelers') || '2', 10);

  // Fetch hotel data
  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      try {
        const apiUrl = `/api/hotels/search/details?hotelId=${id}&checkIn=${checkInStr}&checkOut=${checkOutStr}`;
        console.log('Fetching hotel data from:', apiUrl);
        const response = await fetchWithAuth(apiUrl);
        
        // Check if the response is OK
        if (!response.ok) {
          // Try to parse as JSON first
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch hotel data');
          } else {
            // If not JSON, get text content for debugging
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText.substring(0, 200) + '...');
            throw new Error(`Server error: ${response.status}`);
          }
        }
        
        // Try to parse the response as JSON
        try {
          const text = await response.text();
          // Log the first part of the response for debugging
          console.log('Response text preview:', text.substring(0, 200) + '...');
          const data = JSON.parse(text) as HotelResponse;
          setHotel(data.hotel);
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching hotel data:', error);
        setError(error instanceof Error ? error.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchHotelData();
    }
  }, [id, checkInStr, checkOutStr, fetchWithAuth]);

  // Handle room selection
  const handleRoomSelect = (room: RoomType, dates: {checkIn: Date, checkOut: Date}, guests: number) => {
    console.log('Selected room:', room.id, room.type);
    console.log('Selected dates:', dates.checkIn, dates.checkOut);
    console.log('Number of guests:', guests);
    
    // Here you would typically navigate to the booking/payment page
    // For example:
    router.push(`/booking/confirm?hotelId=${id}&roomId=${room.id}&checkIn=${dates.checkIn.toISOString().split('T')[0]}&checkOut=${dates.checkOut.toISOString().split('T')[0]}&guests=${guests}&${query.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse max-w-full">
          {/* Back button placeholder */}
          <div className="h-6 bg-muted rounded w-40 mb-6"></div>
          
          {/* Image carousel placeholder - with proper max-width */}
          <div className="h-64 bg-muted rounded-lg mb-6 w-full"></div>
          
          {/* Hotel details section */}
          <div className="flex flex-wrap items-start gap-4 mb-6">
            {/* Logo placeholder */}
            <div className="h-24 w-24 bg-muted rounded-md flex-shrink-0"></div>
            
            {/* Hotel info placeholders */}
            <div className="flex-grow max-w-full">
              <div className="h-8 bg-muted rounded w-3/4 max-w-md mb-2"></div>
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full max-w-lg"></div>
            </div>
          </div>
          
          {/* Room selection placeholder */}
          <div className="space-y-4 w-full">
            <div className="h-10 bg-muted rounded w-1/4 max-w-xs"></div>
            <div className="h-32 bg-muted rounded-lg w-full"></div>
            <div className="h-32 bg-muted rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-foreground">Hotel not found</p>
        <Link href="/hotels" className="text-primary hover:underline">
          Back to hotel search
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Back button */}
      <Link
        href="/hotels"
        className="inline-flex items-center text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to search results
      </Link>

      {/* Hotel image carousel */}
      <div className="mb-4">
        <ImageCarousel
          images={Array.isArray(hotel.images) ? hotel.images : Object.values(hotel.images || {})}
          altText={hotel.name}
          height="h-80"
        />
      </div>

      {/* Hotel name, star rating, and address */}
      <div className="mb-6 flex items-start">
        {/* Hotel logo or fallback icon - INCREASED SIZE */}
        <div className="mr-4 flex-shrink-0 flex items-center">
          {hotel.logo ? (
            <img 
              src={hotel.logo} 
              alt={`${hotel.name} logo`} 
              className="w-24 h-24 object-contain"
            />
          ) : (
            <Building2 className="w-24 h-24 text-primary" />
          )}
        </div>
        
        {/* Hotel details */}
        <div className="py-1">
          <h1 className="text-2xl font-bold text-foreground">{hotel.name}</h1>
          <div className="flex items-center mt-1 mb-2">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <p className="text-muted-foreground">
            {hotel.address.street}, {hotel.address.city}, {hotel.address.postalCode}, {hotel.address.country}
          </p>
        </div>
      </div>

      {/* Room selection component */}
      <RoomSelection 
        hotel={hotel}
        onRoomSelect={handleRoomSelect}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialRoomCount={travelers}
      />
    </div>
  );
}