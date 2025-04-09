"use client";

import { MapPin, Star, Heart, Hotel as HotelIcon } from "lucide-react";
import Link from "next/link";
import ImageCarousel from "@/components/Images/ImageCarousel";
import { Hotel } from "@/types/hotel";
import { useSearchParams } from "next/navigation";
import { useState,useMemo } from "react";

interface HotelCardProps {
  hotel: Hotel;
  selected?: boolean;
}

export default function HotelCard({ 
  hotel,
  selected = false,
}: HotelCardProps) {
  const [logoError, setLogoError] = useState(false);
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination');
  const destinationFull = searchParams.get('destinationFull');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');


  const query = new URLSearchParams();

  if (destination) query.set('destination', destination);
  if (destinationFull) query.set('destinationFull', destinationFull);
  if (checkInDate) query.set('checkInDate', checkInDate);
  if (checkOutDate) query.set('checkOutDate', checkOutDate);
   // 1. If hotel.logo is e.g. "upload/hotels/logo123.png", transform it to "/api/images?p=upload/hotels/logo123.png"
 const logoUrl = hotel.logo
? `/api/images?p=${encodeURIComponent(hotel.logo)}`
 : undefined;

    
  return (
    <div className={`bg-card rounded-lg border ${selected ? 'border-2 border-primary shadow-md' : 'border-border hover:border-muted-foreground'} overflow-hidden shadow-sm transition-all`}>
      <div className="flex h-40">
        {/* Hotel image with fixed height */}
        <div className="w-1/3 relative">
          <ImageCarousel
            images={Object.values(hotel.images || {})}
            altText={hotel.name}
            height="h-40"
            showIndicators={true}
          />
          
          {/* Hotel icon in top-left corner */}
          <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center overflow-hidden border border-border">
            {hotel.logo && !logoError ? (
              <img 
                src={logoUrl}
                alt="Hotel brand"
                className="w-full h-full object-cover" // Fixed: using object-cover to fill the circle without stretching
                onError={() => setLogoError(true)}
              />
            ) : (
              <HotelIcon className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>
        
        {/* Hotel details */}
        <div className="w-2/3 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">{hotel.name}</h3>
                <div className="flex items-center mt-1">
                  {Array.from({ length: hotel.starRating }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                  <span className="ml-1 text-xs text-muted-foreground">Hotel</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="font-bold text-2xl text-primary">${hotel.price}</p>
              </div>
            </div>
            
            <div className="flex items-center mt-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground text-xs">
                {hotel.address.street}, {hotel.address.city}, {hotel.address.country}
              </span>
            </div>
          </div>
          
          {/* Call-to-action */}
          <div className="flex justify-end mt-3">
            <Link
               href={`/hotels/${hotel.id}?${query.toString()}`}
              className="inline-block bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View Hotel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}