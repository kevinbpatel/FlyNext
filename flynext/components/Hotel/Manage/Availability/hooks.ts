import { useState, useEffect } from "react";
import { format } from "date-fns";
import { RoomType, RoomAvailability } from "./types";
import { formatChartData } from "./utils";

export const useRoomTypes = (hotelId: string, fetchWithAuth: any) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/hotels/${hotelId}/rooms`, {
          method: "GET",
        });
        
        if (response.ok) {
          const data = await response.json();
          setRoomTypes(data.roomTypes || []);
          
          // Set first room type as selected by default
          if (data.roomTypes && data.roomTypes.length > 0) {
            setSelectedRoomType(data.roomTypes[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching room types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [hotelId, fetchWithAuth]);

  return {
    roomTypes,
    selectedRoomType,
    setSelectedRoomType,
    loading
  };
};

export const useAvailabilityData = (
  hotelId: string,
  selectedRoomType: string | null,
  dateRange: { from: Date; to: Date },
  fetchWithAuth: any
) => {
  const [availability, setAvailability] = useState<Record<string, RoomAvailability>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!selectedRoomType || !hotelId) return;

      try {
        setLoading(true);
        
        const startDate = format(dateRange.from, "yyyy-MM-dd");
        const endDate = format(dateRange.to, "yyyy-MM-dd");
        
        // Updated API endpoint to match the new RESTful structure
        const response = await fetchWithAuth(
          `/api/hotels/${hotelId}/rooms/${selectedRoomType}/availability?startDate=${startDate}&endDate=${endDate}`,
          { method: "GET" }
        );
        
        if (response.ok) {
          const data = await response.json();
          const availabilityData = data.room.availability || {};
          setAvailability(availabilityData);
          
          // Format data for the chart
          const formattedData = formatChartData(availabilityData);
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRoomType) {
      fetchAvailabilityData();
    }
  }, [hotelId, selectedRoomType, dateRange, fetchWithAuth]);

  return {
    availability,
    chartData,
    loading
  };
};