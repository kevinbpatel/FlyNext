import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FilterControlsProps } from "./types";

// shadcn components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const FilterControls: React.FC<FilterControlsProps> = ({
  roomTypes,
  selectedRoomType,
  setSelectedRoomType,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Room Type Selector */}
      <div className="w-full md:w-64">
        <label className="block text-sm font-medium text-foreground mb-1">
          Room Type
        </label>
        <Select
          value={selectedRoomType || ""}
          onValueChange={(value) => setSelectedRoomType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a room type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map((roomType) => (
              <SelectItem key={roomType.id} value={roomType.id}>
                {roomType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker */}
      <div className="w-full md:w-auto">
        <label className="block text-sm font-medium text-foreground mb-1">
          Date Range
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:w-[300px] justify-start text-left font-normal border-border"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                  {format(dateRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FilterControls;