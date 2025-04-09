"use client";

import { 
  Calendar as CalendarIcon, 
  Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface RoomSelectionFiltersProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateRangeChange: (range: DateRange | undefined) => void;
  roomCount: number;
  onRoomCountChange: (count: number) => void;
  maxRooms?: number;
}

export function RoomSelectionFilters({
  dateRange,
  onDateRangeChange,
  roomCount,
  onRoomCountChange,
  maxRooms = 10
}: RoomSelectionFiltersProps) {
  // Format dates for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "MMM dd, yyyy");
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const nights = calculateNights();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Date Range Picker */}
      <div className="w-full md:w-2/3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start text-left font-normal border border-border"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </span>
                      <span className="font-medium text-foreground">
                        {nights} {nights === 1 ? 'night' : 'nights'}
                      </span>
                    </div>
                  </>
                ) : (
                  formatDate(dateRange.from)
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Room Count */}
      <div className="w-full md:w-1/3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start text-left font-normal border border-border"
            >
              <Hotel className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Rooms</span>
                <span className="font-medium text-foreground">{roomCount} {roomCount === 1 ? 'room' : 'rooms'}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Number of Rooms</h4>
              <p className="text-sm text-muted-foreground">
                Select the number of rooms you'd like to book. 
                This applies to the selected room type.
              </p>
              <div className="flex items-center justify-between">
                <span>Rooms</span>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRoomCountChange(Math.max(1, roomCount - 1))}
                    disabled={roomCount <= 1}
                    className="h-8 w-8 rounded-l p-0"
                  >
                    -
                  </Button>
                  <div className="w-10 text-center border-t border-b border-border h-8 flex items-center justify-center">
                    {roomCount}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onRoomCountChange(Math.min(maxRooms, roomCount + 1))}
                    disabled={roomCount >= maxRooms}
                    className="h-8 w-8 rounded-r p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button 
                className="w-full mt-2"
                onClick={() => document.body.click()} // Close the popover
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default RoomSelectionFilters;