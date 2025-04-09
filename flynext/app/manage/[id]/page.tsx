"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building, 
  HotelIcon, 
  BedDouble, 
  CalendarRange, 
  BarChart3, 
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Hotel } from "@/types/hotel";
import Sidebar from "@/components/Layout/Sidebar";

// Import components
import HotelOverview from "@/components/Hotel/Manage/HotelOverview";
import RoomTypes from "@/components/Hotel/Manage/RoomsTypes/RoomTypes";
import Bookings from "@/components/Hotel/Manage/Bookings/Bookings";
import Availability from "@/components/Hotel/Manage/Availability";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params?.id as string;
  const { isAuthenticated, isLoading, fetchWithAuth } = useAuthRedirect(`/hotels/${hotelId}`);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isLoading && hotelId) {
      fetchHotelDetails();
    }
  }, [isAuthenticated, isLoading, hotelId]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotel(data.hotel);
      } else {
        console.error("Failed to fetch hotel details:", await response.text());
        setHotel(null);
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items for the sidebar
  const navigationItems = [
    { id: "overview", label: "Hotel Overview", icon: <HotelIcon className="w-5 h-5" /> },
    { id: "rooms", label: "Room Types", icon: <BedDouble className="w-5 h-5" /> },
    { id: "bookings", label: "Bookings", icon: <CalendarRange className="w-5 h-5" /> },
    { id: "availability", label: "Availability", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center p-8 bg-destructive/10 rounded-lg">
          <p className="text-destructive">Hotel not found or you don't have permission to view it.</p>
          <Link 
            href="/manage" 
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }
  const logoUrl = hotel.logo
  ? `/api/images?p=${encodeURIComponent(hotel.logo)}`
   : undefined;
  return (
    <div className="container mx-auto py-8">
      {/* Hotel Header */}
      <div className="mb-8">
        <Link 
          href="/manage" 
          className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Hotels
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center mr-4 overflow-hidden">
              {hotel.logo ? (
                <img 
                  src={logoUrl} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{hotel.name}</h1>
              <div className="flex items-center text-amber-500 mt-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <div key={i} className="w-4 h-4 fill-current text-amber-500">★</div>
                ))}
                {Array.from({ length: 5 - hotel.starRating }).map((_, i) => (
                  <div key={i} className="w-4 h-4 text-muted dark:text-muted-foreground">★</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>{hotel.address.street}, {hotel.address.postalCode}</p>
          <p>{hotel.address.city}, {hotel.address.country}</p>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Use the new Sidebar component */}
        <Sidebar 
          navigationItems={navigationItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 bg-card rounded-lg shadow-sm border border-border p-6">
          {activeTab === "overview" && <HotelOverview hotel={hotel} onUpdate={fetchHotelDetails} fetchWithAuth={fetchWithAuth} />}
          {activeTab === "rooms" && <RoomTypes hotelId={hotelId} fetchWithAuth={fetchWithAuth} />}
          {activeTab === "bookings" && <Bookings hotelId={hotelId} fetchWithAuth={fetchWithAuth} />}
          {activeTab === "availability" && <Availability hotelId={hotelId} fetchWithAuth={fetchWithAuth} />}
        </div>
      </div>
    </div>
  );
}