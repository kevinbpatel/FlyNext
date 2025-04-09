// Common types for room management

export interface ImagePreview {
  file: File;
  preview: string;
  name: string;
}

export interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string[];
  images: Record<string, string>;
  _formError?: string; // To store form-specific errors
}

export interface RoomTypeFormData {
  id?: string;
  name: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string[];
}

export interface RoomTypesProps {
  hotelId: string;
  fetchWithAuth: any;
}

export interface AddRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  hotelId: string;
}

export interface EditRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  roomType: RoomType;
  hotelId: string;
}