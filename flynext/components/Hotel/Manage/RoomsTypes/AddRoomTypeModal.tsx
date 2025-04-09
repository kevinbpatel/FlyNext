"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { AddRoomTypeModalProps } from "./types";
import RoomTypeForm from "./RoomTypeForm";

export default function AddRoomTypeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  hotelId 
}: AddRoomTypeModalProps) {
  // Initial data for a new room type
  const initialData = {
    name: "",
    pricePerNight: 0,
    availableRooms: 1,
    amenities: ["WiFi", "TV", "Air Conditioning"]
  };

  const handleSubmit = async (formData: FormData) => {
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room Type</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new room type for your hotel.
          </DialogDescription>
        </DialogHeader>
        
        <RoomTypeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitButtonText="Add Room Type"
          hotelId={hotelId}
        />
      </DialogContent>
    </Dialog>
  );
}