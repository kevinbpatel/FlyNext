export interface RoomType {
  id: string;
  name: string;
  availableRooms: number;
}

export interface RoomAvailability {
  date: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

export interface ChartDataItem {
  date: string;
  fullDate: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

export interface AvailabilityProps {
  hotelId: string;
  fetchWithAuth: any;
}

export interface FilterControlsProps {
  roomTypes: RoomType[];
  selectedRoomType: string | null;
  setSelectedRoomType: (value: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
}

export interface AvailabilityChartProps {
  chartData: ChartDataItem[];
  selectedRoomTypeDetails: RoomType | undefined;
  getBarColor: (occupancy: number) => string;
}

export interface NoDataDisplayProps {
  selectedRoomType: string | null;
}