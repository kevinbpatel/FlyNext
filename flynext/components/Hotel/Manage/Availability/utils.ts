import { format } from "date-fns";
import { RoomAvailability, ChartDataItem } from "./types";

// Format data for the chart
export const formatChartData = (
  availabilityData: Record<string, RoomAvailability>
): ChartDataItem[] => {
  const dates = Object.keys(availabilityData).sort();
  
  return dates.map(date => {
    const { totalRooms, bookedRooms, availableRooms } = availabilityData[date];
    return {
      date: format(new Date(date), "MMM dd"),
      fullDate: date,
      totalRooms,
      bookedRooms,
      availableRooms,
    };
  });
};

// Get occupancy percentage
export const getOccupancyPercentage = (
  availability: Record<string, RoomAvailability>,
  date: string
): number => {
  if (!availability[date]) return 0;
  
  const { totalRooms, bookedRooms } = availability[date];
  if (totalRooms === 0) return 0;
  
  return Math.round((bookedRooms / totalRooms) * 100);
};

// Get custom colors for bars based on occupancy
export const getBarColor = (occupancy: number): string => {
  if (occupancy >= 90) return "hsl(var(--destructive))"; // Red for high occupancy
  if (occupancy >= 70) return "hsl(var(--chart-3))"; // Orange/rust for medium-high
  if (occupancy >= 40) return "hsl(var(--chart-1))"; // Blue/primary for medium
  return "hsl(var(--chart-2))"; // Green/amber for low occupancy
};