"use client";

import { useState, useEffect } from "react";
import { BedDouble, Plus } from "lucide-react";
import AddRoomTypeModal from "./AddRoomTypeModal";
import EditRoomTypeModal from "./EditRoomTypeModal";
import { RoomType, RoomTypesProps } from "./types";
import RoomTypeCard from "./RoomTypeCard";
import EmptyState from "@/components/ui/empty-state";

export default function RoomTypes({ hotelId, fetchWithAuth }: RoomTypesProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Fetch room types from the API
      const response = await fetchWithAuth(`/api/hotels/${hotelId}/rooms`, {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        setRoomTypes(data.roomTypes || []);
      } else {
        console.error("Failed to fetch room types:", response.status, response.statusText);
        setApiError("Could not fetch room data from API.");
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      setApiError("An error occurred while fetching room data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoomType = async (newRoomType: FormData) => {
    try {
      // Log form data except images for debugging
      console.log("Adding room with data:", {
        name: newRoomType.get("name"),
        pricePerNight: newRoomType.get("pricePerNight"),
        availableRooms: newRoomType.get("availableRooms"),
        amenities: newRoomType.get("amenities")
      });
      
      // Send as FormData without Content-Type header
      const response = await fetchWithAuth(`/api/hotels/${hotelId}/rooms`, {
        method: "POST",
        body: newRoomType, // Send the FormData as is
      });
      
      if (response.ok) {
        setIsAddModalOpen(false);
        fetchRoomTypes();
      } else {
        // Check if the response has content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            console.error("Error adding room type:", errorData);
            setApiError(errorData.message || `Failed to add room type: ${response.statusText}`);
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            setApiError(`Failed to add room type: ${response.status} ${response.statusText}`);
          }
        } else {
          console.error("Error response with no JSON content:", response.status, response.statusText);
          setApiError(`Failed to add room type: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleAddRoomType:", error);
      setApiError(`Error: ${(error as Error).message}`);
    }
  };

  const handleEditRoomType = async (updatedRoomType: FormData) => {
    try {
      setApiError(null);
      
      // Get room ID from FormData
      const roomId = updatedRoomType.get("id") as string;
      
      // Send as FormData without Content-Type header
      const response = await fetchWithAuth(`/api/hotels/${hotelId}/rooms/${roomId}`, {
        method: "PUT",
        body: updatedRoomType,
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setIsEditModalOpen(false);
          fetchRoomTypes();
        } catch (parseError) {
          // Even if parsing fails, the update was successful
          setIsEditModalOpen(false);
          fetchRoomTypes();
        }
      } else {
        // Handle error responses
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            
            // Handle specific errors
            if (errorData.message && errorData.message.includes("Cannot set availableRooms")) {
              if (selectedRoomType) {
                setSelectedRoomType({
                  ...selectedRoomType,
                  _formError: errorData.message
                });
              }
            } else if (errorData.errors) {
              const errorMessage = Object.entries(errorData.errors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(", ");
              
              if (selectedRoomType) {
                setSelectedRoomType({
                  ...selectedRoomType,
                  _formError: `Validation failed: ${errorMessage}`
                });
              }
            } else {
              setApiError(errorData.message || `Error: ${response.statusText}`);
            }
          } else {
            setApiError(`Error (${response.status}): ${response.statusText}`);
          }
        } catch (parseError) {
          setApiError(`Could not process server response (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error updating room type:", error);
      setApiError(`Error: ${(error as Error).message}`);
    }
  };

  const openEditModal = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsEditModalOpen(true);
  };

  const handleDeleteRoomType = async (roomTypeId: string) => {
    try {
      // Delete a room type using the API
      const response = await fetchWithAuth(`/api/hotels/${hotelId}/rooms/${roomTypeId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchRoomTypes();
      } else {
        // Check if the response has content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json") && response.status !== 204) {
          try {
            const errorData = await response.json();
            console.error("Error deleting room type:", errorData);
            setApiError(errorData.message || `Failed to delete room type: ${response.statusText}`);
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            setApiError(`Failed to delete room type: ${response.status} ${response.statusText}`);
          }
        } else {
          console.error("Error response with no JSON content:", response.status, response.statusText);
          setApiError(`Failed to delete room type: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      setApiError("An error occurred while deleting the room type");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div>
      {apiError && (
        <div className="mb-6 p-3 bg-yellow-600/10 rounded-md border border-yellow-600/20 text-foreground text-sm dark:bg-yellow-400/10 dark:border-yellow-400/20">
          <p className="font-medium text-foreground">API Warning:</p>
          <p>{apiError}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Room Types</h2>
        {roomTypes.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room Type
          </button>
        )}
      </div>

      {roomTypes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roomTypes.map((roomType) => (
            <RoomTypeCard
              key={roomType.id}
              roomType={roomType}
              onEdit={openEditModal}
              onDelete={handleDeleteRoomType}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BedDouble className="w-12 h-12 text-muted-foreground" />}
          title="No Room Types Yet"
          description="Add room types to your hotel to start accepting bookings."
          buttonText="Add Room Type"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Room Type Modal */}
      {isAddModalOpen && (
        <AddRoomTypeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddRoomType}
          hotelId={hotelId}
        />
      )}
      
      {/* Edit Room Type Modal */}
      {isEditModalOpen && selectedRoomType && (
        <EditRoomTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditRoomType}
          roomType={selectedRoomType}
          hotelId={hotelId}
        />
      )}
    </div>
  );
}