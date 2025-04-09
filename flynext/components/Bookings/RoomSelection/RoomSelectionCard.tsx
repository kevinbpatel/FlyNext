"use client";

import { useState } from "react";
import ImageCarousel from "@/components/Images/ImageCarousel";
import AmenityBadge from "@/components/Hotel/Manage/RoomsTypes/AmenityBadge";
import AddToBookingModal from "@/components/Bookings/AddToBookingModal";

// Types based on the backend response
export interface RoomType {
  id: string;
  type: string;
  pricePerNight: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  images: string[];
}

interface RoomSelectionCardProps {
  roomType: RoomType;
  onSelect: (room: RoomType) => void;
  checkIn?: Date;
  checkOut?: Date;
  roomQuantity: number;
}

export function RoomSelectionCard({ 
  roomType, 
  onSelect, 
  checkIn, 
  checkOut,
  roomQuantity
}: RoomSelectionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReserveClick = () => {
    // Open the modal instead of using onSelect
    setIsModalOpen(true);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
      {/* Room image carousel */}
      <div className="relative h-48">
        {roomType.images && roomType.images.length > 0 ? (
          <ImageCarousel
            images={roomType.images}
            altText={roomType.type}
            height="h-48"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        
        {/* Room image count indicator */}
        {roomType.images && roomType.images.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs rounded-full px-2 py-1">
            {roomType.images.length} photos
          </div>
        )}
      </div>
      
      {/* Room details */}
      <div className="p-4">
        <h3 className="font-bold text-foreground">{roomType.type}</h3>
        
        {/* Amenities */}
        <div className="mt-2 flex flex-wrap gap-2">
          {roomType.amenities && roomType.amenities.slice(0, 4).map((amenity, index) => (
            <AmenityBadge key={index} amenity={amenity} />
          ))}
        </div>
        
        {/* Room availability info */}
        <div className="mt-2 text-sm text-muted-foreground">
          <span>{roomType.availableRooms} Rooms Available</span>
        </div>
        
        {/* Price section */}
        <div className="mt-4 flex justify-between items-center">
          <div className="font-bold text-xl text-foreground">
            CA ${roomType.pricePerNight.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            per night
          </div>
        </div>
        
        {/* Reserve button or sold out indicator */}
        {roomType.availableRooms > 0 ? (
          <button 
            className="mt-4 w-full bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
            onClick={handleReserveClick}
          >
            Add to Cart
          </button>
        ) : (
          <div className="mt-4 w-full text-center py-2 text-destructive font-medium">
            We are sold out
          </div>
        )}
      </div>

      {/* AddToBookingModal for room booking */}
      <AddToBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={roomType}
        roomQuantity={roomQuantity}
        checkIn={checkIn || new Date()}
        checkOut={checkOut || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        modalType="room"
      />
    </div>
  );
}

export default RoomSelectionCard;