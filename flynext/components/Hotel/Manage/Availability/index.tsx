"use client";

import React, { useState } from "react";
import { addDays } from "date-fns";
import { useRoomTypes, useAvailabilityData } from "./hooks";
import { getBarColor } from "./utils";
import { AvailabilityProps } from "./types";

// Components
import FilterControls from "./FilterControls";
import AvailabilityChart from "./AvailabilityChart";
import NoDataDisplay from "./NoDataDisplay";

export default function Availability({ hotelId, fetchWithAuth }: AvailabilityProps) {
  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Custom hooks for data fetching
  const { roomTypes, selectedRoomType, setSelectedRoomType, loading: loadingRoomTypes } = useRoomTypes(hotelId, fetchWithAuth);
  const { chartData, loading: loadingAvailability } = useAvailabilityData(hotelId, selectedRoomType, dateRange, fetchWithAuth);

  // Get the selected room type details
  const getSelectedRoomTypeDetails = () => {
    return roomTypes.find(room => room.id === selectedRoomType);
  };

  // Combined loading state
  const loading = loadingRoomTypes && !chartData.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Room Availability</h2>
      </div>

      {/* Filters */}
      <FilterControls
        roomTypes={roomTypes}
        selectedRoomType={selectedRoomType}
        setSelectedRoomType={setSelectedRoomType}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Availability Chart or No Data Display */}
      {selectedRoomType && chartData.length > 0 ? (
        <AvailabilityChart
          chartData={chartData}
          selectedRoomTypeDetails={getSelectedRoomTypeDetails()}
          getBarColor={getBarColor}
        />
      ) : (
        <NoDataDisplay selectedRoomType={selectedRoomType} />
      )}
    </div>
  );
}