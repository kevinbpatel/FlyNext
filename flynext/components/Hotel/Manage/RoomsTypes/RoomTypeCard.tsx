"use client";

import { useState } from "react";
import {
  BedDouble,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { RoomType } from "./types";
import ImageCarousel from "@/components/Images/ImageCarousel";
import AmenityBadge from "./AmenityBadge";
import DeleteConfirmation from "@/components/ui/delete-confirmation";

interface RoomTypeCardProps {
  roomType: RoomType;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomTypeId: string) => void;
}

export default function RoomTypeCard({ roomType, onEdit, onDelete }: RoomTypeCardProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const roomImages = roomType.images ? Object.values(roomType.images) : [];
  
  const confirmDelete = () => {
    setDeleteConfirmation(true);
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation(false);
  };
  
  const handleDelete = () => {
    onDelete(roomType.id);
    setDeleteConfirmation(false);
  };
  
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
      {/* Room Images */}
      <ImageCarousel
        images={roomImages}
        altText={roomType.name}
        fallbackIcon={<BedDouble className="w-12 h-12 text-muted-foreground" />}
      />
      
      {/* Room Details */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-foreground">{roomType.name}</h3>
            <p className="text-primary font-medium">${roomType.pricePerNight} / night</p>
          </div>
          
          <div className="flex">
            <button
              onClick={() => onEdit(roomType)}
              className="text-muted-foreground hover:text-primary p-1"
              title="Edit Room Type"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={confirmDelete}
              className="text-muted-foreground hover:text-destructive p-1 ml-1"
              title="Delete Room Type"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center mt-3 text-sm text-foreground">
          <span>{roomType.availableRooms} Rooms Available</span>
        </div>
        
        {roomType.amenities && roomType.amenities.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {roomType.amenities.map((amenity, index) => (
                <AmenityBadge key={index} amenity={amenity} />
              ))}
            </div>
          </div>
        )}
        
        {deleteConfirmation && (
          <DeleteConfirmation
            onCancel={cancelDelete}
            onConfirm={handleDelete}
            message="Are you sure you want to delete this room type?"
          />
        )}
      </div>
    </div>
  );
}