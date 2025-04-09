"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { EditRoomTypeModalProps, RoomTypeFormData } from "./types";
import RoomTypeForm from "./RoomTypeForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditRoomTypeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roomType, 
  hotelId 
}: EditRoomTypeModalProps) {
  const [formError, setFormError] = useState<string | null>(roomType._formError || null);

  // Convert the roomType to the form data format
  const initialData: RoomTypeFormData = {
    id: roomType.id,
    name: roomType.name,
    pricePerNight: roomType.pricePerNight,
    availableRooms: roomType.availableRooms,
    amenities: roomType.amenities || [],
  };

  const handleSubmit = async (formData: FormData) => {
    setFormError(null);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Handle any errors
      console.error("Error submitting form:", error);
    }
  };

  // Update error message if it changes in the roomType prop
  if (roomType._formError && roomType._formError !== formError) {
    setFormError(roomType._formError);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room Type</DialogTitle>
          <DialogDescription>
            Update the details for "{roomType.name}".
          </DialogDescription>
        </DialogHeader>
        
        {formError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {formError}
            </AlertDescription>
          </Alert>
        )}
        
        <RoomTypeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitButtonText="Save Changes"
          hotelId={hotelId}
          existingImages={roomType.images}
        />
        
        <DialogFooter className="mt-6 hidden">
          {/* Form buttons are now in the RoomTypeForm component */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}