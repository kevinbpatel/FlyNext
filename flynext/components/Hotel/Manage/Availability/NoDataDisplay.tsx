import React from "react";
import { BarChart3 } from "lucide-react";
import { NoDataDisplayProps } from "./types";

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ selectedRoomType }) => {
  return (
    <div className="bg-muted rounded-lg p-8 text-center">
      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-medium text-foreground mb-2">No Availability Data</h3>
      <p className="text-muted-foreground mb-4">
        {!selectedRoomType
          ? "Please select a room type to view availability."
          : "No availability data for the selected room type and date range."}
      </p>
    </div>
  );
};

export default NoDataDisplay;