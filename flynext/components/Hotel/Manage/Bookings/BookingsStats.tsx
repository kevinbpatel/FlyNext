"use client";

interface BookingsStatsProps {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export function BookingsStats({
  totalBookings,
  confirmedBookings,
  cancelledBookings
}: BookingsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="text-sm text-muted-foreground">Total Bookings</div>
        <div className="text-2xl font-bold text-card-foreground">{totalBookings}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="text-sm text-muted-foreground">Confirmed Bookings</div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{confirmedBookings}</div>
      </div>
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="text-sm text-muted-foreground">Cancelled Bookings</div>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{cancelledBookings}</div>
      </div>
    </div>
  );
}