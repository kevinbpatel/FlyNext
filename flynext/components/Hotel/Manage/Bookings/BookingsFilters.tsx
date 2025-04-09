"use client";

import { format } from "date-fns";
import { X, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RoomType } from "./types";

interface BookingsFiltersProps {
  roomTypes: RoomType[];
  roomTypeFilter: string;
  selectedDate: Date | undefined;
  setRoomTypeFilter: (value: string) => void;
  setSelectedDate: (value: Date | undefined) => void;
  clearFilters: () => void;
}

export function BookingsFilters({
  roomTypes,
  roomTypeFilter,
  selectedDate,
  setRoomTypeFilter,
  setSelectedDate,
  clearFilters,
}: BookingsFiltersProps) {
  return (
    <div className="bg-card p-4 rounded-lg border border-border mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Room Type Filter */}
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              {roomTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Single Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 justify-start text-left font-normal w-[180px] border-border"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "MMM dd, yyyy")
                ) : (
                  <span>Select a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>
          
          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}