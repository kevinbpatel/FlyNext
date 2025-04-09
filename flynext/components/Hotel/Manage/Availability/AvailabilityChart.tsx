import React from "react";
import { format } from "date-fns";
import { Info } from "lucide-react";
import { AvailabilityChartProps } from "./types";

// shadcn components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Recharts for visualizations
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

const AvailabilityChart: React.FC<AvailabilityChartProps> = ({
  chartData,
  selectedRoomTypeDetails,
  getBarColor,
}) => {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-card-foreground">
          {selectedRoomTypeDetails?.name} Availability
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bar heights represent the number of rooms booked for each day.</p>
              <p>Colors indicate occupancy level (green = low, red = high).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="h-[400px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              label={{ 
                value: "Number of Rooms", 
                angle: -90, 
                position: "insideLeft",
                style: { textAnchor: "middle" }
              }}
              domain={[0, selectedRoomTypeDetails?.availableRooms || 10]}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const occupancy = Math.round((data.bookedRooms / data.totalRooms) * 100);
                  
                  return (
                    <div className="bg-popover p-3 border border-border shadow-md rounded-md text-popover-foreground">
                      <p className="font-medium">{format(new Date(data.fullDate), "MMMM d, yyyy")}</p>
                      <p className="text-sm">
                        <span className="font-medium">Booked:</span> {data.bookedRooms} rooms
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Available:</span> {data.availableRooms} rooms
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: getBarColor(occupancy) }}>
                        {occupancy}% Occupied
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="bookedRooms"
              name="Rooms Booked"
              radius={[4, 4, 0, 0]}
              barSize={30}
              fill="#3b82f6"
            >
              {chartData.map((entry, index) => {
                const occupancy = Math.round((entry.bookedRooms / entry.totalRooms) * 100);
                return (
                  <Cell key={`cell-${index}`} fill={getBarColor(occupancy)} />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center mt-6 gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600 mr-2"></div>
          <span className="text-sm text-card-foreground">Low Occupancy (&lt;40%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-blue-500 dark:bg-blue-600 mr-2"></div>
          <span className="text-sm text-card-foreground">Medium Occupancy (40-69%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-orange-500 dark:bg-orange-600 mr-2"></div>
          <span className="text-sm text-card-foreground">High Occupancy (70-89%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-500 dark:bg-red-600 mr-2"></div>
          <span className="text-sm text-card-foreground">Very High Occupancy (90-100%)</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityChart;