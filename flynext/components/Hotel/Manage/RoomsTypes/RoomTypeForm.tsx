"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MultipleImageUpload from "@/components/Images/MultipleImageUpload";
import { RoomTypeFormData, ImagePreview } from "./types";

interface RoomTypeFormProps {
  initialData: RoomTypeFormData;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: React.ReactNode;
  cancelButtonText?: string;
  hotelId: string;
  existingImages?: Record<string, string> | null;
}

export default function RoomTypeForm({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText = "Save Changes",
  cancelButtonText = "Cancel",
  hotelId,
  existingImages = null
}: RoomTypeFormProps) {
  const [formData, setFormData] = useState<RoomTypeFormData>(initialData);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [amenity, setAmenity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  // Add a new state to track the availableRooms input display value
  const [availableRoomsInput, setAvailableRoomsInput] = useState(
    initialData.availableRooms.toString()
  );

  // Initialize images with existing room images (if any)
  useEffect(() => {
    if (existingImages) {
      const initialImages: ImagePreview[] = Object.entries(existingImages).map(([key, url]) => ({
        file: new File([], key), // Create a placeholder File object
        preview: url,
        name: key
      }));
      setImages(initialImages);
    }
  }, [existingImages]);

  // Update availableRoomsInput when initialData changes
  useEffect(() => {
    setAvailableRoomsInput(initialData.availableRooms.toString());
  }, [initialData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "pricePerNight" || name === "capacity" || name === "availableRooms"
        ? parseFloat(value) || 0
        : value
    });
  };

  const handleAddAmenity = () => {
    if (amenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity.trim()]
      });
      setAmenity("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    const updatedAmenities = [...formData.amenities];
    updatedAmenities.splice(index, 1);
    setFormData({
      ...formData,
      amenities: updatedAmenities
    });
  };

  const handleImagesChange = (newImages: ImagePreview[]) => {
    // Track which existing images were removed (if this is an edit operation)
    if (existingImages) {
      const currentUrls = newImages
        .map(img => img.preview)
        .filter(url => Object.values(existingImages).includes(url));

      const removedUrls = Object.values(existingImages)
        .filter(url => !currentUrls.includes(url));

      if (removedUrls.length > 0) {
        setImagesToDelete(prev => [...prev, ...removedUrls]);
      }
    }

    setImages(newImages);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Room name is required";
    if (formData.pricePerNight <= 0) newErrors.pricePerNight = "Price must be greater than 0";
    if (formData.availableRooms < 0) newErrors.availableRooms = "Available rooms cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create FormData for submission
      const formDataToSend = new FormData();

      // Debugging - log what we're sending
      console.log("Preparing form data for submission:", {
        id: formData.id,
        name: formData.name,
        pricePerNight: formData.pricePerNight,
        availableRooms: formData.availableRooms,
        amenitiesCount: formData.amenities.length
      });

      // Add basic form fields with correct field names to match backend expectations
      if (formData.id) formDataToSend.append("id", formData.id);
      formDataToSend.append("hotelId", hotelId);

      // Using field names that backend expects
      formDataToSend.append("name", formData.name);
      // The backend expects 'price' or 'pricePerNight'
      formDataToSend.append("price", formData.pricePerNight.toString());
      formDataToSend.append("pricePerNight", formData.pricePerNight.toString());
      formDataToSend.append("availableRooms", formData.availableRooms.toString());
      formDataToSend.append("amenities", JSON.stringify(formData.amenities));

      // If editing (has id), add image tracking info
      if (formData.id && existingImages) {
        // Get remaining existing images (not marked for deletion)
        const remainingImages = images
          .filter(img => Object.values(existingImages).includes(img.preview))
          .map(img => img.preview);

        formDataToSend.append("remainingImages", JSON.stringify(remainingImages));
        formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Add new images to FormData
      // For new room: all images are new
      // For existing room: only include images not from the existingImages
      const newImagesToUpload = existingImages
        ? images.filter(img => !Object.values(existingImages).includes(img.preview))
        : images;

      newImagesToUpload.forEach((image) => {
        formDataToSend.append(image.name, image.file);
      });

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Room Basic Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Room Type Name*</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pricePerNight">Price Per Night ($)*</Label>
            <Input
              id="pricePerNight"
              name="pricePerNight"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={formData.pricePerNight === 0 ? "" : formData.pricePerNight}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow valid decimal numbers (including empty string)
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setFormData({
                    ...formData,
                    pricePerNight: value === "" ? 0 : parseFloat(value)
                  });
                }
              }}
              className={errors.pricePerNight ? "border-destructive" : ""}
            />
            {errors.pricePerNight && <p className="text-destructive text-sm mt-1">{errors.pricePerNight}</p>}
          </div>

          <div>
            <Label htmlFor="availableRooms">Available Rooms*</Label>
            <Input
              id="availableRooms"
              name="availableRooms"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={availableRoomsInput}
              onChange={(e) => {
                const value = e.target.value;

                // Only allow empty string or non-negative integers
                if (value === "" || /^[0-9]+$/.test(value)) {
                  // Update both display value and form data
                  setAvailableRoomsInput(value);
                  setFormData({
                    ...formData,
                    availableRooms: value === "" ? 0 : parseInt(value)
                  });
                }
                // Don't update anything if invalid input (like negative sign)
              }}
              onBlur={() => {
                // When the field loses focus, if it's empty, show "0"
                if (availableRoomsInput === "") {
                  setAvailableRoomsInput("0");
                }
              }}
              className={errors.availableRooms ? "border-destructive" : ""}
            />
            {errors.availableRooms && <p className="text-destructive text-sm mt-1">{errors.availableRooms}</p>}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <Label>Amenities</Label>
        <div className="flex items-center mt-1 mb-2">
          <Input
            value={amenity}
            onChange={(e) => setAmenity(e.target.value)}
            placeholder="Add an amenity (e.g., WiFi, TV, etc.)"
            className="mr-2"
          />
          <Button
            type="button"
            onClick={handleAddAmenity}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.amenities.map((item, index) => (
            <div
              key={index}
              className="bg-muted px-3 py-1 rounded-full flex items-center text-sm text-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemoveAmenity(index)}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Room Images */}
      <div>
        <MultipleImageUpload
          images={images}
          onImagesChange={handleImagesChange}
          sectionTitle="Room Images"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button">
            {cancelButtonText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}