"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BookingsTableProps {
  filteredBookings: any[]; 
  openCancelDialog: (bookingId: string) => void;
}

export function BookingsTable({ filteredBookings, openCancelDialog }: BookingsTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-500 dark:bg-green-700 dark:text-green-100">Confirmed</Badge>;
      case "cancelled":
      case "canceled":
        return <Badge className="bg-red-500 dark:bg-red-700 dark:text-red-100">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 dark:bg-yellow-700 dark:text-yellow-100">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 dark:bg-gray-700 dark:text-gray-100">{status || "Unknown"}</Badge>;
    }
  };

  const getRoomType = (booking: any) => {
    if (!booking.bookingRooms || booking.bookingRooms.length === 0) return "Unknown";
    const firstRoom = booking.bookingRooms[0];
    return firstRoom.room?.type || "Unknown";
  };

  // Helper to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">First</TableHead>
              <TableHead className="w-20">Last</TableHead>
              <TableHead className="w-32">Email</TableHead>
              <TableHead className="w-24">Phone</TableHead>
              <TableHead className="w-24">Room</TableHead>
              <TableHead className="w-24">Check-in</TableHead>
              <TableHead className="w-24">Check-out</TableHead>
              <TableHead className="w-20">Total</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.user?.firstName || "-"}
                  </TableCell>
                  <TableCell>
                    {booking.user?.lastName || "-"}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate max-w-[120px]">
                            {booking.user?.email || "-"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{booking.user?.email || "-"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {booking.user?.phone || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="block truncate max-w-[80px]">
                      {getRoomType(booking)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.checkIn)}
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.checkOut)}
                  </TableCell>
                  <TableCell>
                    ${booking.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status?.toLowerCase() === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openCancelDialog(booking.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No bookings found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}