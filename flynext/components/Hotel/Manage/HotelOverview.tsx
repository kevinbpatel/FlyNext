"use client";

import { useState } from "react";
import {
  Building,
  Edit,
  X,
  Star,
  MapPin
} from "lucide-react";
import type { Hotel } from "@/types/hotel";
import HotelForm, { HotelFormData } from "@/components/Hotel/Manage/HotelForm";
import ImageCarousel from "../../Images/ImageCarousel";

interface HotelOverviewProps {
  hotel: Hotel;
  onUpdate: () => void;
  fetchWithAuth: any;
}

export default function HotelOverview({ hotel, onUpdate, fetchWithAuth }: HotelOverviewProps) {
  const [editing, setEditing] = useState(false);
  
  // Convert hotel.images object to array for carousel
  const hotelImages = hotel.images ? Object.values(hotel.images) : [];

  const handleSubmit = async (formData: FormData) => {
    // Add hotelId to the formData
    formData.append("hotelId", hotel.id);
    
    try {
      // Make request to the API endpoint
      const response = await fetchWithAuth(`/api/hotels/${hotel.id}`, {
        method: "PUT",
        body: formData,
      });
  
      if (!response.ok) {
        // Try to parse error as JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update hotel: ${response.status}`);
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          throw new Error(`Failed to update hotel: ${response.statusText || response.status}`);
        }
      }
  
      // Success - refresh data and exit edit mode
      const result = await response.json();
      console.log("Hotel updated successfully:", result);
      onUpdate();
      setEditing(false);
    } catch (error) {
      console.error("Error updating hotel:", error);
      // Handle the error appropriately in your UI
      if (error instanceof Error) {
        alert(error.message || "An error occurred while updating the hotel");
      } else {
        alert("An error occurred while updating the hotel");
      }
    }
  };

  if (editing) {
    const initialData: HotelFormData = {
      name: hotel.name,
      starRating: hotel.starRating,
      address: {
        street: hotel.address.street,
        postalCode: hotel.address.postalCode,
        city: hotel.address.city,
        country: hotel.address.country,
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Edit Hotel Information</h2>
          <button
            onClick={() => setEditing(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <HotelForm
          initialData={initialData}
          logoUrl={hotel.logo || null}
          existingImages={hotel.images || null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
          submitButtonText="Save Changes"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Hotel Overview</h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Hotel
        </button>
      </div>

      {/* Hotel Images Carousel */}
      {hotelImages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-foreground">Hotel Images</h3>
          <ImageCarousel
            images={hotelImages}
            altText={hotel.name}
            height="h-80"
            showIndicators={true}
            buttonSize="medium"
            className="rounded-lg overflow-hidden"
          />
        </div>
      )}

      {/* Hotel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium flex items-center mb-4 text-foreground">
            <Building className="w-5 h-5 mr-2 text-primary" />
            Hotel Details
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Hotel Name</p>
              <p className="font-medium text-foreground">{hotel.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Star Rating</p>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                {Array.from({ length: 5 - hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-muted dark:text-muted-foreground" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium flex items-center mb-4 text-foreground">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            Hotel Address
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Street Address</p>
              <p className="font-medium text-foreground">{hotel.address.street}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium text-foreground">{hotel.address.city}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Postal Code</p>
                <p className="font-medium text-foreground">{hotel.address.postalCode}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium text-foreground">{hotel.address.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}