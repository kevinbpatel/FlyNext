"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hotel as HotelIcon, Building, Plus, Star } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Hotel } from "@/types/hotel";

export default function HotelsPage() {
  const { isAuthenticated, isLoading, fetchWithAuth } = useAuthRedirect("/hotels");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchHotels();
    }
  }, [isAuthenticated, isLoading]);
  
  const fetchHotels = async () => {
    try {
      const response = await fetchWithAuth("/api/hotels/view", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(data.hotels || []);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Your Hotels</h1>
        <Link
          href="/manage/add"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Hotels */}
        {hotels.map((hotel) => {
  // Convert raw hotel.logo => /api/images?p=...
  const logoUrl = hotel.logo
    ? `/api/images?p=${encodeURIComponent(hotel.logo)}`
    : null;

  return (
    <div key={hotel.id} className="border border-border shadow-sm rounded-lg overflow-hidden bg-card">
      <div className="h-40 bg-muted flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-foreground">{hotel.name}</h3>
        <div className="text-sm text-muted-foreground mb-2">
          <div>{hotel.address.street}</div>
          <div>
            {hotel.address.city}, {hotel.address.country}
          </div>
        </div>
        <div className="flex items-center text-amber-500 mb-4">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
          {Array.from({ length: 5 - hotel.starRating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-muted dark:text-muted-foreground" />
          ))}
        </div>
        <div className="flex justify-end">
          <Link
            href={`/manage/${hotel.id}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
})}

      </div>
      
      {hotels.length === 0 && !loading && (
        <div className="text-center mt-8 p-8 bg-muted rounded-lg">
          <HotelIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No Hotels Yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first hotel property.</p>
          <Link
            href="/manage/add"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hotel
          </Link>
        </div>
      )}
    </div>
  );
}