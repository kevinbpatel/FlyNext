"use client";

import { 
  Wifi, 
  Tv, 
  Coffee, 
  Wind, 
  Bath,
  Car,
  Dumbbell,
  Utensils,
  WavesLadder,
  Wine,
  BellRing,
  Lock,
  Globe,
  Shirt,
  Cigarette,
  Star
} from "lucide-react";

interface AmenityBadgeProps {
  amenity: string;
}

export default function AmenityBadge({ amenity }: AmenityBadgeProps) {
  // Function to render amenity icons
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    
    // Network/Internet
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('internet') || amenityLower.includes('ethernet')) return <Globe className="w-4 h-4" />;
    
    // Entertainment
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return <Tv className="w-4 h-4" />;
    
    // Refreshments
    if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return <Coffee className="w-4 h-4" />;
    if (amenityLower.includes('mini') || amenityLower.includes('bar') || amenityLower.includes('fridge')) return <Wine className="w-4 h-4" />;
    
    // Climate
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return <Wind className="w-4 h-4" />;
    
    // Bathroom
    if (amenityLower.includes('bath') || amenityLower.includes('tub')) return <Bath className="w-4 h-4" />;
    
    // Parking
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) return <Car className="w-4 h-4" />;
    
    // Fitness
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
    
    // Food
    if (amenityLower.includes('breakfast') || amenityLower.includes('restaurant')) return <Utensils className="w-4 h-4" />;
    
    // Pool
    if (amenityLower.includes('pool') || amenityLower.includes('swim')) return <WavesLadder className="w-4 h-4" />;
    
    // Services
    if (amenityLower.includes('service') || amenityLower.includes('concierge')) return <BellRing className="w-4 h-4" />;
    
    // Security
    if (amenityLower.includes('safe') || amenityLower.includes('security')) return <Lock className="w-4 h-4" />;
    
    // Laundry
    if (amenityLower.includes('laundry') || amenityLower.includes('iron')) return <Shirt className="w-4 h-4" />;
    
    // Smoking
    if (amenityLower.includes('smoking') || amenityLower.includes('smoke')) return <Cigarette className="w-4 h-4" />;
    
    // Default icon for all other amenities
    return <Star className="w-4 h-4" />;
  };

  const icon = getAmenityIcon(amenity);

  return (
    <div className="flex items-center bg-muted px-2 py-1 rounded-md text-xs text-muted-foreground">
      {icon}
      <span className="ml-1">{amenity}</span>
    </div>
  );
}