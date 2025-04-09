"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { RoomSelectionCard, RoomType } from "./RoomSelectionCard";
import { RoomSelectionFilters } from "./RoomSelectionFilters";

interface Hotel {
  id: string;
  name: string;
  rooms: RoomType[];
  // other properties not needed for this component
}

interface RoomSelectionProps {
  hotel?: Hotel;
  onRoomSelect?: (room: RoomType, dates: {checkIn: Date, checkOut: Date}, roomCount: number) => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
  initialRoomCount?: number;
}

export function RoomSelection({ 
  hotel, 
  onRoomSelect,
  initialCheckIn = new Date(),
  initialCheckOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
  initialRoomCount = 1
}: RoomSelectionProps) {
  // State for date range
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: initialCheckIn,
    to: initialCheckOut,
  });
  
  // State for room count (replacing guest count)
  const [roomCount, setRoomCount] = useState(initialRoomCount);
  
  // Handle date selection - fixed to handle same-day selections
  const handleDateSelect = (range: DateRange | undefined) => {
    // Handle when user selects same date twice (prevents the crash)
    if (range?.from && range?.from === range?.to) {
      // Add one day to the end date
      const nextDay = new Date(range.from);
      nextDay.setDate(nextDay.getDate() + 1);
      
      setDateRange({
        from: range.from,
        to: nextDay
      });
    } else {
      setDateRange({
        from: range?.from || undefined,
        to: range?.to || undefined
      });
    }
  };
  
  // Calculate number of nights safely
  const nights = dateRange?.from && dateRange?.to
    ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  // Handle room selection
  const handleRoomSelect = (room: RoomType) => {
    if (onRoomSelect && dateRange?.from && dateRange?.to) {
      onRoomSelect(room, { checkIn: dateRange.from, checkOut: dateRange.to }, roomCount);
    }
  };
  
  // Handle room count changes
  const handleRoomCountChange = (count: number) => {
    setRoomCount(count);
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-foreground">Choose your room</h2>
      
      {/* Using the updated RoomSelectionFilters component with roomCount */}
      <RoomSelectionFilters
        dateRange={dateRange}
        onDateRangeChange={handleDateSelect}
        roomCount={roomCount}
        onRoomCountChange={handleRoomCountChange}
        maxRooms={hotel?.rooms?.reduce((max, room) => Math.max(max, room.availableRooms), 0) || 10}
      />
      
      {/* Room cards */}
      {hotel?.rooms && hotel.rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotel.rooms.map((roomType) => (
            <RoomSelectionCard
              key={roomType.id}
              roomType={roomType}
              onSelect={handleRoomSelect}
              checkIn={dateRange.from}
              checkOut={dateRange.to}
              roomQuantity={roomCount}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No rooms available for this hotel</p>
        </div>
      )}
    </div>
  );
}

export default RoomSelection;